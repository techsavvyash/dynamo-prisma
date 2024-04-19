/**
 * @description File houses functions to generate Prisma Schema from JSON Schema
 */
import * as fs from "fs";
import { createModels } from "./dsl-helper";
import { checkJSON } from "./checks";
import { createSchema, print } from "prisma-schema-dsl";
import { Schema } from "./types/dynamoPrisma.types";
import { parseExistingEnums, parseExistingModels } from "./utils/utils";
import { validateAndMigrate } from "./commands";

export async function generateIfNoSchema(jsonData: Schema): Promise<string[]> {
  if (!jsonData.dataSource || !jsonData.generator) {
    throw new Error(
      JSON.stringify({
        error: true,
        message:
          "Data source and generator blocks are required to generate Prisma schema",
      })
    );
  }

  const models: any[] = createModels(jsonData.schema);
  console.log("Model generated");

  const DataSource: string = `datasource db {\n provider = "postgresql"\n url = env("DATABASE_URL")\nextensions=[vector,pg_trgm]\n}`;

  var result: string;
  const Generator: string = `generator client {\n provider = "prisma-client-js"\n previewFeatures=["postgresqlExtensions", "views"] \n}`;

  console.log("Generator generated");
  jsonData.enum
    ? console.log("Enum exists")
    : console.log("Enum does not exist");
  const Enum = jsonData.enum ? jsonData.enum! : [];
  console.log("Enum generated");
  const schema = createSchema(models, Enum, undefined, undefined);
  const schemaString = await print(schema);
  result = Generator + "\n" + DataSource + "\n" + schemaString;

  console.warn("schema generated");
  const migrateModels: string[] = [];
  fs.mkdirSync("./prisma", { recursive: true });
  fs.writeFile("./prisma/schema.prisma", result, (err) => {
    if (err) {
      return {
        status: false,
        message: "Error writing Prisma schema",
        error: err,
      };
    } else {
      console.log("Prisma schema generated successfully!");
      migrateModels.push(...jsonData.schema.map((model) => model.schemaName));
      // validateAndMigrate(migrateModels);
    }
  });

  return migrateModels;
}
export async function generateSchemaWhenFilePresent(
  jsonData: Schema,
  prismaFilePath: string
): Promise<string[]> {
  const models: any[] = createModels(jsonData.schema);

  let result: string;

  const Enum = jsonData.enum ? jsonData.enum! : [];
  const schema = createSchema(models, Enum, undefined, undefined);
  const schemaString = await print(schema);
  fs.appendFileSync(prismaFilePath, "\n\n" + schemaString, "utf8");
  const migrateModels: string[] = [];
  fs.mkdirSync("./prisma", { recursive: true });
  fs.writeFile(
    "./prisma/schema.prisma",
    fs.readFileSync(prismaFilePath, "utf8"),
    (err) => {
      if (err) {
        throw new Error(
          JSON.stringify({
            status: false,
            message: "Error writing Prisma schema",
            error: err,
          })
        );
      } else {
        console.log("🚀 Prisma schema generated successfully!");
        migrateModels.push(...jsonData.schema.map((model) => model.schemaName));
        // validateAndMigrate(migrateModels);
      }
    }
  );
  return migrateModels;
}

/**
 * @description Generate Prisma Schema File from JSON Schema
 * @param jsonData
 * @param prismaFilePath
 * @param failOnWarn
 */
export async function generatePrismaSchemaFile(
  jsonData: Schema,
  prismaFilePath: string = "./prisma/schema.prisma",
  failOnWarn: boolean = false
) {
  const prismaFileExists = fs.existsSync(prismaFilePath);

  const models = prismaFileExists
    ? parseExistingModels(fs.readFileSync(prismaFilePath, "utf8"))
    : [];
  const enums = prismaFileExists
    ? parseExistingEnums(fs.readFileSync(prismaFilePath, "utf8"))
    : [];
  console.log("🔎 Checking and Sanitising JSON Schema.");
  jsonData = checkJSON(jsonData, { models, enums }, failOnWarn);

  if (prismaFileExists) {
    console.log("📝 Prisma Schema file exists.");
    return await generateSchemaWhenFilePresent(jsonData, prismaFilePath);
  } else {
    return await generateIfNoSchema(jsonData);
  }
}
