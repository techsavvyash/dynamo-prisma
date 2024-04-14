# Exported Function in dynamo Prisma

## Installation

Follow guide given in [README.md](../README.md)

- #### generateSchemaFromJson(jsonData, prismaFilePath);

  Argument of function:

  - `jsonData: Schema` - JSON as per schema model which is defined in [JSON Schema](./schema.md)

  - OPTIONAL `prismaFilePath?: string` - Path of the prisma schema file. If file is present, it will append the new schema to the existing schema. If file is not present, it will create a new schema file. Default value is `./prisma/schema.prisma`

  Returns: {status: boolean, message: string, error: string}

- #### GenerateSchemaFile(filePath);

  Argument of function:

  - `filePath: String` - file path of the json file.

  Returns: {status: boolean, message: string, error: string}
