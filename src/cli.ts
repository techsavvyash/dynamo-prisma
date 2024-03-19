import { GenerateSchemaFile } from "./fileExists";

export function main(argv: string[]) {
  console.warn(argv);
  if (argv.length < 3) {
    console.error("Please provide the file address as an argument.");
    process.exit(1);
  }

  const filePath = argv[2];
  GenerateSchemaFile(filePath);
  return filePath;
}

main(process.argv);
