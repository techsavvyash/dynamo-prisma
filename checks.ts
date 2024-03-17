import { Schema, Field } from "./schemaGenerator";
import * as fs from "fs";

interface Model {
  schemaName: string;
}

export function JsonChecks(jsonData: Schema): void {
  let enumNames: string[] =
    jsonData.enum!.map((enums) => enums.name.toLowerCase()) || [];
  let models: string[] = jsonData.schema.map((model) =>
    model.schemaName.toLowerCase()
  );
  enumNames.push(
    "string",
    "int",
    "float",
    "boolean",
    "datetime",
    "json",
    ...models
  );

  const fieldCounts: { [fieldName: string]: number } = {};

  if (fs.existsSync("./prisma/schema.prisma")) {
    console.log("File exists");
    const fileContent = fs.readFileSync("./prisma/schema.prisma", "utf-8");

    // const regex = /model\s+(\w+)\s+{/g;
    // const matches = fileContent.matchAll(regex);
    // for (const match of matches) {
    //   const modelName = match[1];
    //   console.log("\n\nPushing Model: ", modelName);
    //   models.push(modelName);
    // }
  } else {
  }

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
        if (![...enumNames].includes(field.type.toLowerCase())) {
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
