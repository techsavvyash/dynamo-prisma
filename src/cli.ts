/**
 * @description This is just for manual testing
 * run: npx ts-node src/cli.ts ./test/schemas/no_unique.json
 */
import { Schema } from "./types/dynamoPrisma.types";
import { generatePrismaSchemaFile } from "./schemaGenerator";
import * as fs from "fs";
import { readJsonFile } from "./utils/utils";
import { validateAndMigrate } from "./commands";

export async function main(argv: string[]) {
  console.warn(argv);
  if (argv.length < 3) {
    console.error("Please provide the file address as an argument.");
    process.exit(1);
  }

  const filePath = argv[2];
  const data = readJsonFile(filePath);
  console.log("data in cli: ", data);
  const migrateModels: any = await generatePrismaSchemaFile(data);
  // validateAndMigrate(migrateModels);

  return filePath;
}

main(process.argv);
