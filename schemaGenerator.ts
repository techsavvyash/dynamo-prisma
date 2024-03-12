import * as fs from "fs";

interface Field {
  name: string;
  type: string;
  isRequired?: boolean;
  isUnique?: boolean;
  isId?: boolean;
  // enum?: string[]; // TODO Add support for enums
  relationName?: string | null;
  relationToFields?: string[];
  relationToReferences?: string[];
  relationOnDelete?: "NONE";
  isList?: boolean;
  default?: any;
}

interface Model {
  name: string;
  fields: Field[];
}

interface DataSourceURL {
  fromEnv: string;
}

interface DataSource {
  name: string;
  provider: string; // TODO enum the values
  url: string | DataSourceURL;
}

interface Schema {
  models: Model[];
  dataSource?: DataSource;
}

function generatePrismaSchema(schema: Schema): string {
  let prismaSchema = "";

  if (schema.dataSource) {
    prismaSchema += `datasource ${schema.dataSource.name} {
  provider = "${schema.dataSource.provider}"
  url      = ${
    typeof schema.dataSource.url === "string"
      ? `"${schema.dataSource.url}"`
      : `env("${schema.dataSource.url.fromEnv}")`
  }
}\n\n`;
  }

  // TODO Generate Enums Assuming enums are not present in the schema

  for (const model of schema.models) {
    prismaSchema += `model ${model.name} {\n`;
    for (const field of model.fields) {
      prismaSchema += `  ${field.name} ${field.type}${
        field.isRequired ? "!" : ""
        // TODO Add check for default value, if default value is autoincrement then it should be int else it should be string
        // TODO Also it shoudnt be nullable
      }${field.isUnique ? " @unique" : ""}${field.isId ? " @id" : ""}${
        field.isList ? "[]" : ""
      }${
        field.relationName ? ` @relation(name: "${field.relationName}")` : ""
      }${
        field.relationToFields
          ? ` @relation(fields: [${field.relationToFields
              .map((f) => `"${f}"`)
              .join(", ")}])`
          : ""
      }${
        field.relationToReferences
          ? ` @relation(references: [${field.relationToReferences
              .map((f) => `"${f}"`)
              .join(", ")}])`
          : ""
      }${
        field.relationOnDelete
          ? ` @relation(onDelete: ${field.relationOnDelete})`
          : ""
      }${field.default !== undefined ? ` @default(${field.default})` : ""}\n`;
    }
    prismaSchema += `}\n\n`;
  }

  return prismaSchema;
}

function generatePrismaSchemaFromFile(filePath: string): void {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return;
    }

    try {
      const schema: Schema = JSON.parse(data);
      const prismaSchema = generatePrismaSchema(schema);

      fs.writeFile("prisma.schema", prismaSchema, (err) => {
        if (err) {
          console.error("Error writing Prisma schema:", err);
        } else {
          console.log("Prisma schema generated successfully!");
        }
      });
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  });
}

if (process.argv.length < 3) {
  console.error("Please provide the file address as an argument.");
  process.exit(1);
}

const filePath = process.argv[2];

generatePrismaSchemaFromFile(filePath);
