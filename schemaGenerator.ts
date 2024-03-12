import * as fs from "fs";
import {
  createDataSource,
  createModel,
  createScalarField,
  createSchema,
  print,
} from "prisma-schema-dsl";
import { DataSourceProvider, ScalarType } from "prisma-schema-dsl-types";

// Interface for Field
interface Field {
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

// Interface for Schema
interface Schema {
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

// Function to read JSON file and generate Prisma schema
function generatePrismaSchemaFromFile(filePath: string): void {
  // Read JSON file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return;
    }

    try {
      // Parse JSON data
      const jsonData: Schema = JSON.parse(data);

      // Create models array
      const models: any[] = [];
      for (const key in jsonData.schema) {
        if (jsonData.schema.hasOwnProperty(key)) {
          const schemaItem = jsonData.schema[key];
          const fields: any[] = [];
          for (const fieldKey in schemaItem.fields) {
            if (schemaItem.fields.hasOwnProperty(fieldKey)) {
              const fieldData = schemaItem.fields[fieldKey];
              fields.push(
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
          models.push(createModel(schemaItem.schemaName, fields));
        }
      }

      const DataSource = createDataSource(
        "db",
        DataSourceProvider.PostgreSQL,
        "localhost"
      );
      // Create Prisma schema
      const schema = createSchema(models, [], DataSource, []);

      // Print Prisma schema
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
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  });
}

// Check if file address is provided as argument
if (process.argv.length < 3) {
  console.error("Please provide the file address as an argument.");
  process.exit(1);
}

const filePath = process.argv[2];

// Generate Prisma schema from file
generatePrismaSchemaFromFile(filePath);
