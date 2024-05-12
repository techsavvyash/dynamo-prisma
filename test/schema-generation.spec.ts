import * as fs from "fs";

import { generatePrismaSchemaFile } from "../src";
import {
  parseExistingEnums,
  parsePrismaSchemaModels,
  readJsonFile,
} from "../src/utils/utils";

describe("tests for schema generation", () => {
  beforeEach(() => {
    try {
      fs.rmdirSync("./prisma", { recursive: true });
    } catch (err) {
      console.error("Error deleting prisma folder");
    }
  });

  it("should generate a schema.prisma for a basic file with no problems", async () => {
    const fileContent = readJsonFile("./test/schemas/demo.json");
    await generatePrismaSchemaFile(fileContent).then((migrationModels) => {
      expect(migrationModels).toBeDefined();
      expect(fs.existsSync("./prisma/schema.prisma")).toBe(true);
      const schemaPrismaContent = fs.readFileSync(
        "./prisma/schema.prisma",
        "utf8"
      );
      expect(schemaPrismaContent).toBeDefined();
      const models = parsePrismaSchemaModels(schemaPrismaContent);
      expect(models).toContain("User");
      expect(models).toContain("Post");
      expect(models).toContain("Comment");
    });
  });
  it("should generate a schema.prisma for a basic file with different casing for types ", async () => {
    const fileContent = readJsonFile("./test/schemas/casing.json");
    await generatePrismaSchemaFile(fileContent).then((migrationModels) => {
      expect(migrationModels).toBeDefined();
      expect(fs.existsSync("./prisma/schema.prisma")).toBe(true);
      const schemaPrismaContent = fs.readFileSync(
        "./prisma/schema.prisma",
        "utf8"
      );
      expect(schemaPrismaContent).toBeDefined();
      const models = parsePrismaSchemaModels(schemaPrismaContent);
      expect(models).toContain("uSer");
      expect(models).toContain("Post");
      expect(models).toContain("Comment");
    });
  });

  it("should generate a schema.prisma for a file with dashes in schema and field name", async () => {
    const fileContent = readJsonFile("./test/schemas/dash_name.json");
    const migrationModels = await generatePrismaSchemaFile(fileContent);
    expect(migrationModels).toBeDefined();
    expect(fs.existsSync("./prisma/schema.prisma")).toBe(true);
    const schemaPrismaContent = fs.readFileSync(
      "./prisma/schema.prisma",
      "utf8"
    );
    expect(schemaPrismaContent).toBeDefined();
    const models = parsePrismaSchemaModels(schemaPrismaContent);
    expect(models).toContain("dash_name");
  });

  it("should generate a schema.prisma for a file with no unique or id field", async () => {
    const fileContent = readJsonFile("./test/schemas/no_unique.json");
    await generatePrismaSchemaFile(fileContent).then((migrationModels) => {
      expect(migrationModels).toBeDefined();
      expect(fs.existsSync("./prisma/schema.prisma")).toBe(true);
      const schemaPrismaContent = fs.readFileSync(
        "./prisma/schema.prisma",
        "utf8"
      );
      expect(schemaPrismaContent).toBeDefined();
      const models = parsePrismaSchemaModels(schemaPrismaContent);
      expect(models).toContain("no_unique");
    });
  });

  it("should generate a schema.prisma for a file with whitespaces in schema and field name", async () => {
    const fileContent = readJsonFile("./test/schemas/whitespace_name.json");
    await generatePrismaSchemaFile(fileContent).then((migrationModels) => {
      expect(migrationModels).toBeDefined();
      expect(fs.existsSync("./prisma/schema.prisma")).toBe(true);
      const schemaPrismaContent = fs.readFileSync(
        "./prisma/schema.prisma",
        "utf8"
      );
      expect(schemaPrismaContent).toBeDefined();
      const models = parsePrismaSchemaModels(schemaPrismaContent);
      expect(models).toContain("white_space_name");
    });
  });

  it("should generate a schema.prisma for a file with vector embeddings in data fields", async () => {
    const fileContent = readJsonFile("./test/schemas/vector_embeddings.json");
    await generatePrismaSchemaFile(fileContent).then((migrationModels) => {
      expect(migrationModels).toBeDefined();
      expect(fs.existsSync("./prisma/schema.prisma")).toBe(true);
      const schemaPrismaContent = fs.readFileSync(
        "./prisma/schema.prisma",
        "utf8"
      );
      expect(schemaPrismaContent).toBeDefined();
      const models = parsePrismaSchemaModels(schemaPrismaContent);
      expect(models).toContain("vector_embedding");
      const pattern = /@default\("text-embedding-ada-002"\)/;
      expect(pattern.test(schemaPrismaContent)).toBe(true);
    });
  });

  it("should generate a schema.prisma for a file with enums", async () => {
    const fileContent = readJsonFile("./test/schemas/enum.json");
    await generatePrismaSchemaFile(fileContent).then((migrationModels) => {
      expect(migrationModels).toBeDefined();
      expect(fs.existsSync("./prisma/schema.prisma")).toBe(true);
      const schemaPrismaContent = fs.readFileSync(
        "./prisma/schema.prisma",
        "utf8"
      );
      expect(schemaPrismaContent).toBeDefined();
      const models = parsePrismaSchemaModels(schemaPrismaContent);
      expect(models).toContain("User");
      const enums = parseExistingEnums(schemaPrismaContent);
      expect(enums).toBeDefined();
      expect(enums.length).toBeGreaterThan(0);
      expect(enums).toContain("UserType");
      const pattern = /@default\("text-embedding-3-large"\)/;
      expect(pattern.test(schemaPrismaContent)).toBe(true);
    });
  });
});
