import { Schema } from "./dynamoPrisma.types";
import * as fs from 'fs';
interface Model {
  schemaName: string;
}

export function JsonChecks(
  jsonData: Schema,
  modelNameFromSchema: string[]
): void {
  jsonData = ensureEachModelHasPrimaryKey(jsonData);
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
    console.log("Duplicates found");
    process.exit(1);
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
        console.log(
          `Autoincrement field ${field.fieldName} in model ${model.schemaName} is not of type Int`
        );
        // console.log("Convert it to int? (true / false) (default: false)");
        // process.stdin.once("data", (input) => {
        //   const convertToInt = input.toString().trim() === "true";
        //   if (!convertToInt) {
        process.exit(1);
        //   }
        //   console.log("Converting to Int...");
        // });
      }
      if (field.uuid && field.type !== "String") {
        console.log(
          `UUID field ${field.fieldName} in model ${model.schemaName} is not of type String`
        );
        process.exit(1);
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

function fixSchemaAndFieldNames(jsonData) {

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
  return fs.existsSync(filePath);
}

function ensureEachModelHasPrimaryKey(jsonData: Schema, failOnWarn = false) {
  // jsonData.schema.forEach((model) => {
  for (const model of jsonData.schema) {
    if (model.schemaName.includes('-')) {
      console.warn('Model name should not contain "-" character, replacing it with "_"');
      model.schemaName = model.schemaName.replace(/-/g, '_');
    }
    if (model.schemaName.includes(' ')) {
      console.warn('Model name should not contain " " character, replacing it with "_"');
      model.schemaName = model.schemaName.replace(/ /g, '_');
    }

    let isPrimaryPresent = false;
    for (const field of model.fields) {
      if (field.fieldName.includes('-')) {
        console.warn('Field name should not contain "-" character, replacing it with "_"');
        field.fieldName = field.fieldName.replace(/-/g, '_');
      }
      if (field.fieldName.includes(' ')) {
        console.warn('Field name should not contain " " character, replacing it with "_"');
        field.fieldName = field.fieldName.replace(/ /g, '_');
      }

      isPrimaryPresent = isPrimaryPresent || field.isId || field.unique;
    }

    if (!isPrimaryPresent) {
      console.warn(
        `Model ${model.schemaName} does not have a primary key, adding a default 'dummy_id_<random>' field with "unique" constraint`
      );
      if (failOnWarn) process.exit(1);
      else {
        model.fields.push({
          fieldName: "dummy_id",
          type: "String",
          description: "Dummy ID of the user",
          maxLength: null,
          default: null,
          nullable: false,
          unique: true,
          isId: true,
          uuid: true,
        });
      }
    }
  }

  return jsonData;
}
