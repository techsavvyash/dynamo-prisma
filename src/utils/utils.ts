import * as fs from "fs";

import {
  AUTO_INCREMENT_LEGAL_TYPES,
  SUPPORTED_DATA_TYPES,
  UUID_LEGAL_TYPES,
} from "./constants";
import { Field, Schema } from "../types/dynamoPrisma.types";
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
    nullable: false,
    unique: true,
    isId: true,
    uuid: true,
  };
}

export function checkIllegalCombinationOfFieldAttributes(
  field: Field,
  definedTypes: string[],
  schemaName: string
) {
  // make sure the field is of a supported type
  if (!definedTypes.includes(field.type)) {
    throw new Error(
      JSON.stringify({
        error: true,
        message: `${field.fieldName} in model ${schemaName} is of type ${
          field.type
        } which is not included in the following types ${definedTypes.toString()}`,
      })
    );
  }

  // make sure that the field is not both autoincrement and uuid
  if (field.autoincrement && field.uuid) {
    throw new Error(
      JSON.stringify({
        error: true,
        message: `${field.fieldName} in model ${schemaName} cannot be both autoincrement and uuid`,
      })
    );
  }

  // make sure if a field is autoincrement then it is of a legal type that supports autoincrement
  if (field.autoincrement && !AUTO_INCREMENT_LEGAL_TYPES.includes(field.type)) {
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
  if (field.uuid && !UUID_LEGAL_TYPES.includes(field.type)) {
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
export function parseExistingModels(fileContent: string) {
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

  console.log("Enums:", enums);
  return enums;
}

export function readJsonFile(filePath: string): Schema {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Invalid file path: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown as Schema;
}
