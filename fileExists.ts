import * as fs from "fs";
import { Schema, createModels } from "./schemaGenerator";
import { JsonChecks } from "./checks";
import { createGenerator, createSchema, print } from "prisma-schema-dsl";
import { exec } from "child_process";

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

export async function generateIfNoSchema(jsonData: Schema): Promise<void> {
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

  const DataSource: string = `datasource db {\n provider = "postgresql"\n url = env("DATABASE_URL")\n}`;

  var result: string;

  const Generator = createGenerator(
    jsonData.generator ? jsonData.generator!.generatorName : "client",
    jsonData.generator ? jsonData.generator!.provider : "prisma-client-js",
    jsonData.generator ? jsonData.generator!.output : undefined, // can be null | undefined | string( // ? Example Value: "node_modules/@prisma/client")
    jsonData.generator ? jsonData.generator!.binaryTargets : undefined // can be null | undefined | string[]
  );

  const Enum = jsonData.enum!;
  const schema = createSchema(models, Enum, undefined, [Generator]);
  const schemaString = await print(schema);
  result = DataSource + "\n" + schemaString;

  // fs.existsSync("./prisma/schema.prisma") // ? Check if prisma file exists, if yes, then append
  // console.log(result);
  console.warn("schema generated");
  // console.log(schema);

  fs.mkdirSync("./prisma", { recursive: true });
  fs.writeFile("./prisma/schema.prisma", result, (err) => {
    if (err) {
      console.error("Error writing Prisma schema:", err);
    } else {
      console.log("Prisma schema generated successfully!");
      validateAndMigrate();
    }
  });
}
async function generateSchemaWhenFilePresent(
  jsonData: Schema,
  prismaFilePath: string
) {
  const FileData = fs.readFileSync(prismaFilePath, "utf8");
  const models: any[] = createModels(jsonData.schema);
  console.log("Model generated");

  var result: string;

  const Enum = jsonData.enum!;
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
      validateAndMigrate();
    }
  });
}

function validateAndMigrate() {
  // TODO: DONE RUN: npx prisma validate
  exec("npx prisma validate", (error, stdout, stderr) => {
    if (error) {
      console.error("Error executing 'npx prisma validate':", error);
      return;
    }
    console.log("commands executed successfully", stdout);
  });

  // TODO: DONE RUN: prisma migrate dev
  exec("prisma migrate dev", (error, stdout, stderr) => {
    if (error) {
      console.error("Error executing 'prisma migrate dev':", error);
      return;
    }
    console.log("Output of 'prisma migrate dev':", stdout);
  });
}
