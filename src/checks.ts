import { SUPPORTED_DATA_TYPES } from "./utils/constants";
import { Schema } from "./types/dynamoPrisma.types";
import {
  checkIllegalCombinationOfFieldAttributes,
  fixDashesAndSpaces,
  generateDummyID,
} from "./utils/utils";

type existingData = {
  models: string[];
  enums: string[];
};

/**
 *
 * @description This function performs a series of checks the JSON Schema by calling the sanitizeJSONSchema function with the defined types
 * @param jsonData
 * @param modelNameFromExistingSchema
 * @param failOnWarn
 */
export function checkJSON(
  jsonData: Schema,
  existingData: existingData,
  failOnWarn = false
): Schema {
  const newModelObjects = [];

  const models = jsonData.schema.map((model) => {
    if (!existingData.models.includes(model.schemaName)) {
      newModelObjects.push(model);
      return model.schemaName;
    } else {
      console.warn(
        `Model ${model.schemaName} is already defined in the schema, please use a different name, skipping this one.`
      );
    }
  });
  const newEnums = [];
  const enumNames =
    jsonData.enum?.map((enumItem) => {
      if (!existingData.enums.includes(enumItem.name)) {
        console.warn(
          `Enum ${enumItem.name} is already defined in the schema, please use a different name, skipping this one.`
        );
        newEnums.push(enumItem);
        return enumItem.name;
      }
    }) ?? [];

  if (newModelObjects.length === 0 && newEnums.length === 0) {
    // we are disregarding the datasource and generator sections being different here since those are not supported very well right now
    throw new Error(
      JSON.stringify({
        error: true,
        message: "This schema is already ingested in the db",
      })
    );
  }
  // drop models with the same name in old file and the new schema
  jsonData.schema = newModelObjects as unknown as Schema["schema"];
  jsonData.enum = newEnums as unknown as Schema["enum"];

  const definedTypes = Array.from(
    new Set([
      ...SUPPORTED_DATA_TYPES,
      ...enumNames,
      ...models,
      ...existingData.models,
      ...existingData.enums,
    ])
  );
  return sanitizeJSONSchema(jsonData, definedTypes, failOnWarn);
}

/**
 *
 * @description This function santizes the received JSON Schema by performing the following:
 *  1. Fix the names of model and fields with legal prisma practices (not allowing '-' and ' ')
 *  2. checks for primary/unique key constraints, i.e. no model is left without a primary key/unique field
 *  3. Checking illegal combination of fields like autoincrement and uuid
 * @param jsonData
 * @param failOnWarn
 * @returns Schema
 */
function sanitizeJSONSchema(
  jsonData: Schema,
  definedTypes = SUPPORTED_DATA_TYPES,
  failOnWarn = false
): Schema {
  for (const model of jsonData.schema) {
    model.schemaName = fixDashesAndSpaces(model.schemaName);
    let isPrimaryPresent = false;
    for (const field of model.fields) {
      field.fieldName = fixDashesAndSpaces(field.fieldName);
      isPrimaryPresent = isPrimaryPresent || field.isId || field.isUnique;
      checkIllegalCombinationOfFieldAttributes(
        field,
        definedTypes,
        model.schemaName
      );
    }

    if (!isPrimaryPresent) {
      console.warn(
        `Model ${model.schemaName} does not have a primary key, adding a default 'dummy_id_<random>' field with "unique" constraint`
      );
      if (failOnWarn) process.exit(1);
      else {
        model.fields.push(generateDummyID());
      }
    }
  }

  return jsonData;
}
