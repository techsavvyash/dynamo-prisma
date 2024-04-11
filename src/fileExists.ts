import * as fs from "fs";
import { createModels } from "./schemaGenerator";
import { JsonChecks, verifyFilePath } from "./checks";
import { createSchema, print } from "prisma-schema-dsl";
import { exec } from "child_process";
import { spawn } from "child_process";
import { Schema } from "./types.dynamoPrisma";

/**
 * Generates the Prisma schema file from JSON data.
 *
 * @param jsonData - The JSON data to generate the schema from.
 * @param prismaFilePath - The path to the Prisma schema file. Defaults to "./prisma/schema.prisma".
 * @returns An object with the status and message if the file path is invalid, or the generated schema output.
 */
export function generatePrismaSchema(
  jsonData: any,
  prismaFilePath: string = "./prisma/schema.prisma"
) {
  if (!verifyFilePath(prismaFilePath)) {
    throw new Error("File cannot have '-' in between its name");
  }
  if (fs.existsSync(prismaFilePath)) {
    console.log("File exists");

    const fileData = fs.readFileSync(prismaFilePath, "utf8");
    const modelRegex = /model\s+(\w+)\s+{/g;
    const models: string[] = [];
    let match;
    while ((match = modelRegex.exec(fileData)) !== null) {
      const modelName = match[1];
      models.push(modelName);
    }

    JsonChecks(jsonData, models);
    generateSchemaWhenFilePresent(jsonData, prismaFilePath);
  } else {
    console.log("Applying Checks....");
    JsonChecks(jsonData, []);
    const output = generateIfNoSchema(jsonData);
    return output;
  }
}

/**
 * Generates the schema file based on the provided file path.
 * If the schema file already exists, it reads the file, extracts the model names,
 * and performs JSON checks against the provided data.
 * If the schema file does not exist, it applies checks against the provided data
 * and generates the schema file if no schema is present.
 * @param filePath The file path to read the JSON data from.
 */
export function GenerateSchemaFile(filePath: string) {
  const prismaFilePath = "./prisma/schema.prisma";
  readJsonFile(filePath)
    .then(async (jsonData: Schema) => {
      if (fs.existsSync(prismaFilePath)) {
        console.log("File exists");

        const fileData = fs.readFileSync(prismaFilePath, "utf8");
        const modelRegex = /model\s+(\w+)\s+{/g;
        const models: string[] = [];
        let match;
        while ((match = modelRegex.exec(fileData)) !== null) {
          const modelName = match[1];
          models.push(modelName);
        }
        console.log("Models:", models);

        JsonChecks(jsonData, models);
        generateSchemaWhenFilePresent(jsonData, prismaFilePath);
      } else {
        console.log("Applying Checks....");
        JsonChecks(jsonData, []);
        generateIfNoSchema(jsonData);
      }
    })
    .catch((err) => {
      console.error("Error reading file", err);
    });
}

/**
 * Reads a JSON file from the specified file path and returns a Promise that resolves to the parsed JSON data.
 * @param filePath - The path of the JSON file to read.
 * @returns A Promise that resolves to the parsed JSON data.
 */
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
        console.log("JSON Parsed");
        resolve(jsonData);
      } catch (error) {
        console.error("Failed to parse. ERROR: ", err);
        reject(error);
      }
    });
  });
}

/**
 * Generates a Prisma schema file based on the provided JSON data.
 * @param jsonData The JSON data containing the schema information.
 * @returns A promise that resolves to an object with the status, message, and error properties.
 */
export async function generateIfNoSchema(
  jsonData: Schema
): Promise<{ status: boolean; message?: string; error?: string }> {
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

  fs.mkdirSync("./prisma", { recursive: true });
  fs.writeFile("./prisma/schema.prisma", result, (err) => {
    if (err) {
      console.error("Error writing Prisma schema:", err);
    } else {
      console.log("Prisma schema generated successfully!");
      let migrateModels: string[] = jsonData.schema.map(
        (model) => model.schemaName
      );
      validateAndMigrate(migrateModels);
    }
  });

  return {
    status: true,
    message: "Prisma schema generated successfully!",
  };
}

/**
 * Generates a Prisma schema file when a file is present.
 * @param jsonData - The JSON data containing the schema.
 * @param prismaFilePath - The path to the Prisma file.
 * @returns An object with the status and message indicating the result of the operation.
 */
export async function generateSchemaWhenFilePresent(
  jsonData: Schema,
  prismaFilePath: string
) {
  if (!verifyFilePath(prismaFilePath)) {
    throw new Error("File cannot have '-' in between its name");
  }
  const FileData = fs.readFileSync(prismaFilePath, "utf8");
  const models: any[] = createModels(jsonData.schema);
  console.log("Model generated");

  var result: string;

  const Enum = jsonData.enum ? jsonData.enum! : [];
  const schema = createSchema(models, Enum, undefined, undefined);
  const schemaString = await print(schema);
  result =
    FileData +
    "\n\n" +
    " // Generated using schemaGenerator" +
    "\n\n" +
    schemaString;

  fs.mkdirSync("./prisma", { recursive: true });
  fs.writeFile("./prisma/schema.prisma", result, (err) => {
    if (err) {
      console.error("Error writing Prisma schema:", err);
    } else {
      console.log("Prisma schema generated successfully!");
      let migrateModels: string[] = jsonData.schema.map(
        (model) => model.schemaName
      );
      validateAndMigrate(migrateModels);
    }
  });
}

/**
 * Validates and migrates the Prisma models.
 * @param migrateModels - An array of model names to be migrated.
 * @returns An object with the status and message of the executed commands.
 */
function validateAndMigrate(migrateModels: string[]) {
  // TODO: DONE RUN: npx prisma validate
  exec("npx prisma validate", (error, stdout, stderr) => {
    if (error) {
      console.error("Error executing 'npx prisma validate':", error);
      return;
    }
    console.log("commands executed successfully", stdout);
  });

  // TODO: DONE RUN: prisma migrate dev
  const shell = spawn(
    "npx",
    ["prisma", "migrate", "dev", "--name", ...migrateModels],
    {
      stdio: "inherit",
    }
  );
  shell.on("close", (code) => {
    console.log("[shell] terminated:", code);
  });
}
