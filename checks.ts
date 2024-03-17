import { Schema, Field } from "./schemaGenerator";
import * as fs from "fs";

interface Model {
  schemaName: string;
}

export function JsonChecks(jsonData: Schema): void {
  console.log("Checking for duplicates...");
  let enumNames: string[] = [];
  let typesDefined: string[] = [];
  jsonData.enum
    ? jsonData.enum!.map((enums) => enumNames.push(enums.name.toLowerCase()))
    : [];
  // || [];
  let models: string[] = jsonData.schema.map((model) =>
    model.schemaName.toLowerCase()
  );
  typesDefined.push(
    "string",
    "int",
    "float",
    "boolean",
    "datetime",
    "json",
    ...enumNames,
    ...models
  );

  console.log(typesDefined);

  const fieldCounts: { [fieldName: string]: number } = {};

  if (!hasNoDuplicates(models)) {
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

      //   if (field.autoincrement && field.type !== "Int") {
      //     console.log(
      //       `Autoincrement field ${field.fieldName} in model ${model.schemaName} is not of type Int`
      //     );
      //     console.log("Convert it to int? (true / false) (default: false)");
      //     process.stdin.once("data", (input) => {
      //       const convertToInt = input.toString().trim().toLowerCase() === "true";
      //       if (!convertToInt) {
      //         process.exit(1);
      //       }
      //       console.log("Converting to Int...");
      //     });
      //   }
      //   if (field.uuid && field.type !== "String") {
      //     console.log(
      //       `UUID field ${field.fieldName} in model ${model.schemaName} is not of type String`
      //     );
      //     process.exit(1);
      //   }

      if (field.autoincrement && field.type !== "Int") {
        console.log(
          `Autoincrement field ${field.fieldName} in model ${model.schemaName} is not of type Int`
        );
        process.exit(1);
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
        if (![...typesDefined].includes(field.type.toLowerCase())) {
          console.error(
            `${field.fieldName} in model ${model.schemaName} is not a foreign key and is not of type String, Int, Float, Boolean, DateTime, Json`
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
    if (seen[item.toLowerCase()]) {
      return false;
    }
    seen[item.toLowerCase()] = true;
  }

  return true;
}
