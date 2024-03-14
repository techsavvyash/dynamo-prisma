import * as fs from "fs";
import {
  createDataSource,
  createGenerator,
  createModel,
  createScalarField,
  createSchema,
  print,
} from "prisma-schema-dsl";
import {
  DataSourceProvider,
  DataSourceURLEnv,
  Enum,
  ScalarType,
  isDataSourceURLEnv,
} from "prisma-schema-dsl-types";

export interface Field {
  fieldName: string;
  type: string;
  description: string;
  maxLength: number | null;
  default?: string | null;
  autoincrement?: boolean;
  uuid?: boolean;
  nullable: boolean;
  unique: boolean;
  isId?: boolean;
  vectorEmbed?: boolean;
  embeddingAlgo?: string;
}

export interface Schema {
  schema: [{ schemaName: string; fields: Field[]; description: string }];
  dataSource?: {
    name: string;
    provider: DataSourceProvider;
    url: {
      url: string;
      fromEnv: string;
    };
  };
  enum?: Enum[];
  // generator?: {
  //   generatorName: string;
  //   fields: [
  //     {
  //       name: string;
  //       attrib: string;
  //     }
  //   ];
  // };
}

export function generatePrismaSchemaFromFile(filePath: string): void {
  console.warn("File path: ", filePath);
  readJsonFile(filePath)
    .then((jsonData: Schema) => {
      const models: any[] = createModels(jsonData.schema);
      console.log("Model generated");
      // console.log(models);
      // console.warn(
      //   "URL is ENV",
      //   isDataSourceURLEnv(jsonData.dataSource!.urlEnv)
      // );           // ! COMES OUT FALSE
      const DataSource = createDataSource(
        jsonData.dataSource?.name ? jsonData.dataSource!.name : "db",
        jsonData.dataSource?.provider
          ? jsonData.dataSource!.provider
          : DataSourceProvider.PostgreSQL,
        jsonData.dataSource?.url
          ? jsonData.dataSource!.url.url
            ? jsonData.dataSource!.url.url
            : // : (env(`${jsonData.dataSource!.url.fromEnv}"`) as unknown as string)
              (`${
                jsonData.dataSource!.url.fromEnv
              }` as unknown as DataSourceURLEnv)
          : "localhost"
      );
      console.log("DataSource generated");
      // console.log(DataSource);

      const Generator = createGenerator("client", "prisma-client-js");
      // const Generator = `
      // generator ${jsonData.generator?.generatorName} {
      //   ${
      //     jsonData.generator?.fields.length
      //       ? jsonData.generator!.fields.map(
      //           (field) => "field.name = field.attrib"
      //         )
      //       : 'provider      = "prisma-client-js"'
      //   }
      // }
      // `;

      const Enum = jsonData.enum!;
      const schema = createSchema(models, Enum, DataSource, [Generator]);
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

export function createModels(schema: Schema["schema"]): any[] {
  const models: any[] = [];
  for (const schemaItem of schema) {
    const fields: any[] = createFields(schemaItem.fields);
    models.push(createModel(schemaItem.schemaName, fields));
  }
  return models;
}

// increment is breaking the code
// ! ERROR: Error parsing JSON: Error: Default must be a number or call expression to autoincrement()
// ? Log by console.war:
/*  String;
    Default
    Default
    Default
    Default
    Default
    Int 
*/
export function createFields(fields: Field[]): any[] {
  // console.error("Feilds: ", fields);
  const result: any[] = [];
  for (const fieldData of fields) {
    console.warn(
      fieldData.isId && fieldData.autoincrement
        ? ScalarType.Int
        : fieldData.isId && fieldData.uuid
        ? ScalarType.String
        : "Default"
    );
    result.push(
      createScalarField(
        fieldData.fieldName,
        // fieldData.type as ScalarType
        fieldData.isId && fieldData.autoincrement
          ? ScalarType.Int
          : fieldData.isId && fieldData.uuid
          ? ScalarType.String
          : (fieldData.type as ScalarType),
        false, //isList boolean | undefined
        !fieldData.nullable, //isRequired boolean | undefined
        fieldData.isId ? fieldData.isId : fieldData.unique,
        fieldData.isId,
        undefined, // isUpdatedAt
        fieldData.isId && fieldData.autoincrement
          ? "autoincrement()"
          : fieldData.isId && fieldData.uuid
          ? "uuid()"
          : fieldData.default, // default values SaclarFeildDefault | undefined
        undefined, // documentation string | undefined
        undefined, // isForeignKey boolean | undefined
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
          `Unsupported("vector[{${
            fieldData.embeddingAlgo!.length
          }}]")` as ScalarType,
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
  // console.log("Results: ", result);
  return result;
}
