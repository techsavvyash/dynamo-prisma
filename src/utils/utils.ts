import * as fs from "fs";

import {
  AUTO_INCREMENT_LEGAL_TYPES,
  SUPPORTED_DATA_TYPES,
  UUID_LEGAL_TYPES,
} from "./constants";
import { Field, Schema } from "../types/dynamoPrisma.types";
import { runPrismaFormat, runPrismaValidate } from "../commands";
export function fixDashesAndSpaces(str: string): string {
  let modified = str;
  let hasDashes = str.includes("-");
  let hasSpaces = str.includes(" ");

  if (hasDashes) {
    console.warn(
      'Model name should not contain "-" character, replacing it with "_"'
    );
    modified = modified.replace(/-/g, "_");
  }

  if (hasSpaces) {
    console.warn(
      'Model name should not contain " " character, replacing it with "_"'
    );
    modified = modified.replace(/ /g, "_");
  }

  return modified;
}

export function generateDummyID() {
  return {
    fieldName: "dummy_id",
    type: "String",
    description: "Dummy ID of the user",
    maxLength: null,
    default: null,
    isNullable: false,
    isUnique: true,
    isId: true,
    isUuid: true,
  };
}

export function matchAndFixFieldTypeCasing(
  field: Field,
  definedTypes: string[]
) {
  const fieldType = field.type.toLowerCase();
  let isPresent = false;
  for (const definedType of definedTypes) {
    if (definedType.toLowerCase() === fieldType) {
      isPresent = true;
      field.type = definedType;
      break;
    }
  }

  if (!isPresent) {
    throw new Error(
      JSON.stringify({
        error: true,
        message: `Field type ${field.type} is not supported`,
      })
    );
  }
}

export function checkIllegalCombinationOfFieldAttributes(
  field: Field,
  definedTypes: string[],
  schemaName: string
) {
  matchAndFixFieldTypeCasing(field, definedTypes);
  // make sure that the field is not both id and nullable
  if (
    field.isNullable &&
    (field.isId || field.isUnique || field.isForeignKey)
  ) {
    throw new Error(
      JSON.stringify({
        error: true,
        message: `${
          field.fieldName
        } in model ${schemaName} cannot be both nullable and ${
          field.isId ? "id" : "foreign key"
        }`,
      })
    );
  }

  // make sure that the field is not both autoincrement and uuid
  if (field.isAutoIncrement && field.isUuid) {
    throw new Error(
      JSON.stringify({
        error: true,
        message: `${field.fieldName} in model ${schemaName} cannot be both autoincrement and uuid`,
      })
    );
  }

  // make sure if a field is autoincrement then it is of a legal type that supports autoincrement
  if (
    field.isAutoIncrement &&
    !AUTO_INCREMENT_LEGAL_TYPES.includes(field.type)
  ) {
    throw new Error(
      JSON.stringify({
        error: true,
        message: `${
          field.fieldName
        } in model ${schemaName} cannot be autoincrement as it is not of any of the following types ${AUTO_INCREMENT_LEGAL_TYPES.toString()}`,
      })
    );
  }

  // make sure if a field is uuid then it is of a legal type that supports uuid
  if (field.isUuid && !UUID_LEGAL_TYPES.includes(field.type)) {
    throw new Error(
      JSON.stringify({
        error: true,
        message: `${
          field.fieldName
        } in model ${schemaName} cannot be uuid as it is not of any of the following types ${UUID_LEGAL_TYPES.toString()}`,
      })
    );
  }
}

// TODO: Change this to use the `pp package`(https://github.com/techsavvyash/pp) package which uses internal prisma DMMF
export function parsePrismaSchemaModels(fileContent: string) {
  const modelRegex = /model\s+(\w+)\s+{/g;
  const models: string[] = [];
  let match;
  while ((match = modelRegex.exec(fileContent)) !== null) {
    const modelName = match[1];
    models.push(modelName);
  }

  console.log("Models:", models);
  return models;
}

export function parseExistingEnums(fileContent: string) {
  const enumRegex = /enum\s+(\w+)\s+{/g;
  const enums: string[] = [];
  let match;
  while ((match = enumRegex.exec(fileContent)) !== null) {
    const enumName = match[1];
    enums.push(enumName);
  }

  return enums;
}

export function readJsonFile(filePath: string): Schema {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Invalid file path: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown as Schema;
}

/**
 * @description Formats and validates the generated prisma schema and updates/creates the schema.prisma file accordiongly
 */
export async function formatValidateAndWrite(
  schemaString: string,
  filePath: string
) {
  // 1. save the current schema.prisma as schema.prisma.bak
  // 2. save the new schema as schema.prisma
  // 3. run prismaformat
  // 4. run prisma validate
  // 5. if validate fails, then delete schema.prisma and rename schema.prisma.bak as schema.prisma
  //    if validate passes, then delete schema.prisma.bak

  let fileExists = false;
  let originalPrismaContent = "";
  if (fs.existsSync(filePath)) {
    fileExists = true;
    originalPrismaContent = fs.readFileSync(filePath, "utf8");
    fs.renameSync(filePath, filePath + ".bak");
  }

  fs.writeFileSync(
    filePath,
    originalPrismaContent + "\n" + schemaString,
    "utf8"
  );

  try {
    await runPrismaFormat();
    await runPrismaValidate();
    // delete the backup
    // TODO: Add error handling with custom error codes on file operations so that the user can perform a manual cleanup and the entire process does not fail
    if (fs.existsSync(filePath + ".bak")) fs.unlinkSync(filePath + ".bak");
  } catch (err) {
    console.log("Error while running prisma format and validate: ", err);
    fs.unlinkSync(filePath);
    if (fileExists) {
      fs.renameSync(filePath + ".bak", filePath);
    }
    throw new Error(
      JSON.stringify({
        error: true,
        message:
          "Previous schema unchanged, the package is not able to generate a valid schema.prisma file for the said input, please check your schema for any errors and report the issue to pacakge maintainers by opening an issue on github with the relevant input",
      })
    );
  }
}
