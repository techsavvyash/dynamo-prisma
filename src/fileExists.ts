import * as fs from "fs";
import { createModels } from "./schemaGenerator";
import { JsonChecks, verifyFilePath } from "./checks";
import { createGenerator, createSchema, print } from "prisma-schema-dsl";
import { exec } from "child_process";
import { spawn } from "child_process";
import { Schema } from "./dynamoPrisma.types";

export function generateSchemaFromJson(
  jsonData: any,
  prismaFilePath: string = "./prisma/schema.prisma"
) {
  if (!verifyFilePath(prismaFilePath)) {
    return {
      status: false,
      message: "File cannot have '-' in between its name",
    };
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
    const output = generateSchemaWhenFilePresent(jsonData, prismaFilePath);
    return output;
  } else {
    console.log("Applying Checks....");
    JsonChecks(jsonData, []);
    const output = generateIfNoSchema(jsonData);
    return output;
  }
}

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
        // generateSchemaWhenFilePresent(jsonData, prismaFilePath);
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

export async function generateIfNoSchema(
  jsonData: Schema
): Promise<{ status: boolean; message?: string; error?: string }> {
  const models: any[] = createModels(jsonData.schema);
  console.log("Model generated");
  // console.log(models);
  // console.warn(
  //   "URL is ENV",
  //   isDataSourceURLEnv(jsonData.dataSource!.urlEnv)
  // );           // ! COMES OUT FALSE

  // const dbUrl = env("DATABASE_URL");
  // const DataSource = createDataSource(
  //   jsonData.dataSource?.name ? jsonData.dataSource!.name : "db",
  //   jsonData.dataSource!.provider || DataSourceProvider.PostgreSQL,
  //   dbUrl
  //   // jsonData.dataSource?.url
  //   //   ? jsonData.dataSource!.url.url
  //   //     ? jsonData.dataSource!.url.url
  //   //     : // : (env(`${jsonData.dataSource!.url.fromEnv}"`) as unknown as string)
  //   //       `${jsonData.dataSource!.url.fromEnv.name}`
  //   //   : "localhost:5432"
  // );
  // console.log("DataSource generated");
  // // console.log(DataSource);

  const DataSource: string = `datasource db {\n provider = "postgresql"\n url = env("DATABASE_URL")\nextensions=[vector,pg_trgm]\n}`;

  var result: string;
  const Generator: string = `generator client {\n provider = "prisma-client-js"\n previewFeatures=["postgresqlExtensions", "views"] \n}`;
  // const Generator = createGenerator(
  //   jsonData.generator ? jsonData.generator!.generatorName : "client",
  //   jsonData.generator ? jsonData.generator!.provider : "prisma-client-js",
  //   jsonData.generator ? jsonData.generator!.output : undefined, // can be null | undefined | string( // ? Example Value: "node_modules/@prisma/client")
  //   jsonData.generator ? jsonData.generator!.binaryTargets : undefined // can be null | undefined | string[]
  // );

  console.log("Generator generated");
  jsonData.enum
    ? console.log("Enum exists")
    : console.log("Enum does not exist");
  const Enum = jsonData.enum ? jsonData.enum! : [];
  console.log("Enum generated");
  const schema = createSchema(models, Enum, undefined, undefined);
  const schemaString = await print(schema);
  result = Generator + "\n" + DataSource + "\n" + schemaString;

  // fs.existsSync("./prisma/schema.prisma") // ? Check if prisma file exists, if yes, then append
  // console.log(result);
  console.warn("schema generated");
  // console.log(schema);

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
export async function generateSchemaWhenFilePresent(
  jsonData: Schema,
  prismaFilePath: string
) {
  if (!verifyFilePath(prismaFilePath)) {
    return {
      status: false,
      message: "File cannot have '-' in between its name",
    };
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
      return {
        status: false,
        message: "Error writing Prisma schema",
        error: err,
      };
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

function validateAndMigrate(migrateModels: string[]) {
  // TODO: DONE RUN: npx prisma validate
  exec("npx prisma validate", (error, stdout, stderr) => {
    if (error) {
      return {
        status: false,
        message: "Error executing 'npx prisma validate'",
        error: error,
      };
    }
    return { status: true, message: "commands executed successfully", stdout };
  });

  // TODO: DONE RUN: prisma migrate dev
  const shell = spawn(
    "npx",
    ["prisma", "migrate", "dev", "--name", ...migrateModels],
    {
      stdio: "inherit",
    }
  );
  shell.on("error", (err) => {
    return {
      status: false,
      message: "Error executing 'npx prisma migrate dev'",
      error: err,
    };
  });
  shell.on("close", (code) => {
    console.log("[shell] terminated:", code);
  });
  return {
    status: true,
    message: "commands executed successfully",
  };
}
