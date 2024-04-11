import { createModel, createScalarField } from "prisma-schema-dsl";
import { AUTO_INCREMENT, ScalarType, UUID } from "prisma-schema-dsl-types";
import { Field, Schema } from "./types.dynamoPrisma";

/**
 * Creates models based on the provided schema.
 * @param schema The schema object containing the schema definition.
 * @returns An array of model objects.
 */
export function createModels(schema: Schema["schema"]): any[] {
  const models: any[] = [];
  for (const schemaItem of schema) {
    const fields: any[] = createFields(schemaItem.fields);
    models.push(createModel(schemaItem.schemaName, fields));
  }
  return models;
}

/**
 * Creates an array of fields based on the provided field data.
 * @param fields - An array of field data.
 * @returns An array of fields.
 */
export function createFields(fields: Field[]): any[] {
  const result: any[] = [];
  for (const fieldData of fields) {
    fieldData.isId && fieldData.autoincrement
      ? console.error("Cannot have String in autoincrement")
      : null;

    result.push(
      createScalarField(
        fieldData.fieldName,
        fieldData.type as ScalarType,
        fieldData.isList || undefined, //isList boolean | undefined
        !fieldData.nullable || false, //isRequired boolean | undefined
        fieldData.isId ? fieldData.isId : fieldData.unique || false,
        fieldData.isId || false,
        undefined, // isUpdatedAt
        fieldData.isId && fieldData.autoincrement
          ? { callee: AUTO_INCREMENT }
          : fieldData.isId && fieldData.uuid
          ? { callee: UUID }
          : fieldData.default || undefined, // default values SaclarFeildDefault | undefined
        undefined, // documentation string | undefined
        fieldData.isForeignKey || false, // isForeignKey boolean | undefined
        undefined // attributes in string | string[] | undefined
      )
    );

    if (fieldData.vectorEmbed) {
      result.push(
        createScalarField(
          `${fieldData.fieldName}Algorithm`,
          "String" as ScalarType,
          false,
          true,
          false,
          false,
          undefined,
          `"${fieldData.embeddingAlgo}"`,
          undefined,
          undefined,
          undefined
        ),

        createScalarField(
          `${fieldData.fieldName}Embedding`,
          `Unsupported("vector(${
            fieldData.embeddingAlgo!.length
          })")` as ScalarType,
          false,
          true,
          false,
          false,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        )
      );
    }
  }
  return result;
}
