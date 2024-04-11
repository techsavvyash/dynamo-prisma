# Exported Function in dynamo Prisma

## Installation

Follow guide given in [README.md](../README.md)

- #### generatePrismaSchema(jsonData, prismaFilePath);

Generates the Prisma schema file from JSON data.

- @param jsonData - The JSON data to generate the schema from.
- @param prismaFilePath - The path to the Prisma schema file. Defaults to "./prisma/schema.prisma".

- @returns An object with the status and message if the file path is invalid, or the generated schema output.
