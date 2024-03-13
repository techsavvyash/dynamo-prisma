import * as fs from "fs";
import {
  createDataSource,
  createModel,
  createScalarField,
  createSchema,
  print,
} from "prisma-schema-dsl";
import { DataSourceProvider, ScalarType } from "prisma-schema-dsl-types";

export interface Field {
  fieldName: string;
  type: string;
  description: string;
  maxLength: number | null;
  default?: string | null;
  nullable: boolean;
  unique: boolean;
  vectorEmbed: boolean;
  embeddingAlgo: string;
}

export interface Schema {
  schema: Record<
    string,
    {
      schemaName: string;
      fields: Record<string, Field>;
      description: string;
    }
  >;
  description: string;
}

export function generatePrismaSchemaFromFile(filePath: string): void {
  console.warn("File path: ", filePath);
  readJsonFile(filePath)
    .then((jsonData: Schema) => {
      const models: any[] = createModels(jsonData.schema);
      console.warn("Model generated");
      // console.log(models);

      const DataSource = createDataSource(
        "db",
        DataSourceProvider.PostgreSQL,
        "localhost"
      );
      console.warn("DataSource generated");
      // console.log(DataSource);

      const schema = createSchema(models, [], DataSource, []);
      console.warn("schema generated");
      // console.log(schema);
      print(schema).then((prismaSchema) => {
        fs.mkdirSync("./prisma", { recursive: true });
        fs.writeFile("./prisma/schema.prisma", prismaSchema, (err) => {
          if (err) {
            console.error("Error writing Prisma schema:", err);
          } else {
            console.log("Prisma schema generated successfully!");
          }
        });
      });
    })
    .catch((error) => {
      console.error("Error parsing JSON:", error);
    });
}

export function readJsonFile(filePath: string): Promise<Schema> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Failed to read File. ERROR: ", err);
        reject(err);
        return;
      }

      try {
        const jsonData: Schema = JSON.parse(data);
        console.log(jsonData);
        resolve(jsonData);
      } catch (error) {
        console.error("Failed to parse. ERROR: ", err);
        reject(error);
      }
    });
  });
}

export function createModels(schema: Record<string, any>): any[] {
  const models: any[] = [];
  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const schemaItem = schema[key];
      const fields: any[] = createFields(schemaItem.fields);
      models.push(createModel(schemaItem.schemaName, fields));
    }
  }
  return models;
}

export function createFields(fields: Record<string, Field>): any[] {
  // console.error("Feilds: ", fields);
  const result: any[] = [];
  for (const fieldKey in fields) {
    if (fields.hasOwnProperty(fieldKey)) {
      const fieldData = fields[fieldKey];
      result.push(
        createScalarField(
          fieldData.fieldName,
          fieldData.type as ScalarType,
          false, //isList boolean | undefined
          !fieldData.nullable, //isRequired boolean | undefined
          fieldData.unique,
          undefined, // isId boolean | undefined
          undefined, // isUpdatedAt  boolean | undefined
          fieldData.default, // default values SaclarFeildDefault | undefined
          undefined, // documentation string | undefined
          undefined, // isForeignKey boolean | undefined
          undefined // attributes in string | string[] | undefined
        )
      );
    }
  }
  // console.log("Results: ", result);
  return result;
}
