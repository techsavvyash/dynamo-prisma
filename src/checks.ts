import { SUPPORTED_DATA_TYPES } from "./utils/constants";
import { Schema } from "./types/dynamoPrisma.types";
import {
  checkIllegalCombinationOfFieldAttributes,
  fixDashesAndSpaces,
  generateDummyID,
} from "./utils/utils";

/**
 *
 * @description This function performs a series of checks the JSON Schema by calling the sanitizeJSONSchema function with the defined types
 * @param jsonData
 * @param modelNameFromExistingSchema
 * @param failOnWarn
 */
export function checkJSON(
  jsonData: Schema,
  modelNameFromExistingSchema: string[],
  failOnWarn = false
): Schema {
  const enumNames: string[] = jsonData.enum
    ? jsonData.enum!.map((enums) => enums.name)
    : [];
  console.log("jsondata: ", jsonData);
  let models: string[] = jsonData.schema.map((model) => model.schemaName);

  const definedTypes = Array.from(
    new Set([
      ...SUPPORTED_DATA_TYPES,
      ...enumNames,
      ...models,
      ...modelNameFromExistingSchema,
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
      isPrimaryPresent = isPrimaryPresent || field.isId || field.unique;
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
