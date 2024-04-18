import { Schema } from "./dynamoPrisma.types";

interface Model {
  schemaName: string;
}

export function JsonChecks(
  jsonData: Schema,
  modelNameFromSchema: string[]
): { status: boolean; message: string } {
  console.error(!ensureEachModelHasPrimaryKey(jsonData));
  if (!ensureEachModelHasPrimaryKey(jsonData)) {
    console.error("No primary key");
    return { status: false, message: "No primary key" };
  }

  console.log("Checking for duplicates...");
  let enumNames: string[] = [];
  let typesDefined: string[] = [];
  jsonData.enum
    ? jsonData.enum!.map((enums) => enumNames.push(enums.name))
    : [];
  // || [];
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
    console.error("Duplicates found");
    return { status: false, message: "Duplicates found" };
  }

  // Check if the autoincrement | uuid is true, and type to be appropiate
  jsonData.schema.forEach((model) => {
    model.fields.forEach((field) => {
      if (field.autoincrement && field.uuid) {
        console.error(
          `${field.fieldName} in model ${model.schemaName} cannot be both autoincrement and uuid`
        );
        process.exit(1);
      }
      if (field.autoincrement && field.type !== "Int") {
        console.error(
          `Autoincrement field ${field.fieldName} in model ${model.schemaName} is not of type Int`
        );
        // process.exit(1);
        return {
          status: false,
          message: "Autoincrement field is not of type Int",
        };
      }
      if (field.uuid && field.type !== "String") {
        console.error(
          `UUID field ${field.fieldName} in model ${model.schemaName} is not of type String`
        );
        // process.exit(1);
        return { status: false, message: "UUID field is not of type String" };
      }
    });
  });

  // check if foreign key is false, and type is not equal to String, Int, Float, Boolean, DateTime, Json
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
          console.error("model: ", field);
          process.exit(1);
        }
      }
    });
  });
}

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
  console.log(jsonData.schema);
  jsonData.schema.length > 0
    ? jsonData.schema.forEach((model) => {
        // console.warn("Model: ", model);
        const primaryKeyFields = model.fields.filter(
          (field) => field.isId || field.unique
        );
        console.warn("Primary key fields: ", primaryKeyFields);
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
