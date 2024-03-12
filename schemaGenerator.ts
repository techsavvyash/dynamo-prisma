const fs = require("fs");

interface AdditionalOptions {
  isRequired?: boolean;
  isUnique?: boolean;
  isDefault?: boolean;
  isNullable?: boolean;
  isIndexed?: boolean;
  isReadOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  format?: string;
  enumValues?: string[];
  examples?: string[];
  description?: string;
  Defaultvalues?: {
    Uuid: boolean;
    Autoincrement: boolean;
  };
}

interface Attribute {
  Name: string;
  Type: string;
  Additional?: AdditionalOptions;
  DefaultValue?: any;
}

interface Fields {
  Attribute: Attribute[];
}

interface Entity {
  name: string;
  fields: Fields;
}

function generatePrismaSchema(entity: Entity): string {
  let prismaSchema = `model ${entity.name} {\n`;

  const attributes = entity.fields.Attribute;
  for (const attribute of attributes) {
    prismaSchema += `  ${attribute.Name}: ${attribute.Type}`;

    if (attribute.Additional) {
      const additional = attribute.Additional;

      if (additional.isRequired) {
        prismaSchema += ` @id`;
      }

      if (additional.isUnique) {
        prismaSchema += ` @unique`;
      }

      if (additional.isIndexed) {
        prismaSchema += ` @index`;
      }

      if (additional.isDefault && attribute.DefaultValue !== undefined) {
        prismaSchema += ` @default(${attribute.DefaultValue})`;
      } else if (
        additional.isDefault &&
        additional.Defaultvalues &&
        additional.Defaultvalues.Autoincrement
      ) {
        prismaSchema += ` @default(autoincrement())`;
      } else if (
        additional.isDefault &&
        additional.Defaultvalues &&
        additional.Defaultvalues.Uuid
      ) {
        prismaSchema += ` @default(uuid())`;
      }

      if (!additional.isNullable) {
        prismaSchema += ` @db.VarChar(${additional.maxLength})`;
      }

      if (additional.enumValues && additional.enumValues.length > 0) {
        prismaSchema += ` @db.Enum(${additional.enumValues
          .map((value) => `"${value}"`)
          .join(", ")})`;
      }
    }

    prismaSchema += `\n`;
  }

  prismaSchema += `}`;

  return prismaSchema;
}

function generatePrismaSchemaFromFile(filePath: string): void {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return;
    }

    try {
      const jsonData: Entity = JSON.parse(data);

      const prismaSchema = generatePrismaSchema(jsonData);

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
