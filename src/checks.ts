import { Schema } from "./types.dynamoPrisma";

interface Model {
  schemaName: string;
}

/**
 * Performs various checks on the provided JSON data and model names.
 * @param jsonData - The JSON data to be checked.
 * @param modelNameFromSchema - An array of model names obtained from the schema.
 */
export function JsonChecks(
  jsonData: Schema,
  modelNameFromSchema: string[]
): boolean {
  // ? Check if the JSON data has primary Key in every model
  if (!ensureEachModelHasPrimaryKey(jsonData)) {
    console.error("Primary key is missing in some models");
    return false;
  }

  console.log("Checking for duplicates...");
  let enumNames: string[] = [];
  let typesDefined: string[] = [];
  jsonData.enum
    ? jsonData.enum!.map((enums) => enumNames.push(enums.name))
    : [];
  let models: string[] = jsonData.schema.map((model) => model.schemaName);
  let modelNameDefinedInSchema: string[] = modelNameFromSchema.map(
    (model) => model
  );

  typesDefined.push(
    "String",
    "Int",
    "Float",
    "Boolean",
    "DateTime",
    "Decimal",
    "Json",
    "Bytes",
    "Unsupported",
    ...enumNames,
    ...models,
    ...modelNameDefinedInSchema
  );

  console.log(typesDefined);

  const fieldCounts: { [fieldName: string]: number } = {};

  if (!hasNoDuplicates(typesDefined)) {
    console.log("Duplicates found");
    process.exit(1);
  }

  jsonData.schema.forEach((model) => {
    model.fields.forEach((field) => {
      if (field.autoincrement && field.uuid) {
        console.error(
          `${field.fieldName} in model ${model.schemaName} cannot be both autoincrement and uuid`
        );
        process.exit(1);
      }
      if (field.autoincrement && field.type !== "Int") {
        console.warn(
          `Autoincrement field ${field.fieldName} in model ${model.schemaName} is not of type Int`
        );
        process.exit(1);
      }
      if (field.uuid && field.type !== "String") {
        console.warn(
          `UUID field ${field.fieldName} in model ${model.schemaName} is not of type String`
        );
        process.exit(1);
      }
    });
  });

  jsonData.schema.forEach((model) => {
    model.fields.forEach((field) => {
      if (!field.isForeignKey) {
        if (![...typesDefined].includes(field.type)) {
          console.error(
            `${field.fieldName} in model ${model.schemaName} is not a foreign key and not of type: "String",
            "Int",
            "Float",
            "Boolean",
            "DateTime",
            "Decimal",
            "Json",
            "Bytes",
            "Unsupported" or any other supported types`
          );
          return false;
        }
      }
    });
  });

  return true;
}

/**
 * Checks if an array of strings has any duplicates.
 * @param result - The array of strings to check for duplicates.
 * @returns A boolean value indicating whether the array has duplicates (false) or not (true).
 */
function hasNoDuplicates(result: string[]): boolean {
  const seen: { [key: string]: boolean } = {};

  for (const item of result) {
    if (seen[item]) {
      return false;
    }
    seen[item] = true;
  }

  return true;
}

/**
 * Verifies if the given file path is valid.
 *
 * @param filePath - The file path to be verified.
 * @returns A boolean value indicating if the file path is valid or not.
 */
export function verifyFilePath(filePath: string): boolean {
  if (filePath.includes("-")) {
    return false;
  } else {
    return true;
  }
}

/**
 * Ensures that each model in the provided JSON data has a primary key.
 * If a model does not have a primary key, an error message is logged and the process exits with code 1.
 *
 * @param jsonData - The JSON data containing the schema information.
 */
function ensureEachModelHasPrimaryKey(jsonData: Schema): boolean {
  // console.log(jsonData);
  jsonData.schema.length > 0
    ? jsonData.schema.forEach((model) => {
        const primaryKeyFields = model.fields.filter(
          (field) => field.isId || field.unique
        );
        if (primaryKeyFields.length === 0) {
          console.error(
            `Model ${model.schemaName} does not have a primary key`
          );
          return false;
          process.exit(1);
        }
      })
    : console.log("Wrong format, ", typeof jsonData);
  return true;
}
