"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing necessary modules
var fs = require("fs");
// Function to generate Prisma schema
function generatePrismaSchema(schema) {
    var prismaSchema = "";
    // Generate DataSource
    if (schema.dataSource) {
        prismaSchema += "datasource ".concat(schema.dataSource.name, " {\n  provider = \"").concat(schema.dataSource.provider, "\"\n  url      = ").concat(typeof schema.dataSource.url === "string"
            ? "\"".concat(schema.dataSource.url, "\"")
            : "env(\"".concat(schema.dataSource.url.fromEnv, "\")"), "\n}\n\n");
    }
    // Generate Enums
    // Assuming enums are not present in the schema
    // Generate Models
    for (var _i = 0, _a = schema.models; _i < _a.length; _i++) {
        var model = _a[_i];
        prismaSchema += "model ".concat(model.name, " {\n");
        for (var _b = 0, _c = model.fields; _b < _c.length; _b++) {
            var field = _c[_b];
            prismaSchema += "  ".concat(field.name, " ").concat(field.type).concat(field.isRequired ? "!" : "").concat(field.isUnique ? " @unique" : "").concat(field.isId ? " @id" : "").concat(field.isList ? "[]" : "").concat(field.relationName ? " @relation(name: \"".concat(field.relationName, "\")") : "").concat(field.relationToFields
                ? " @relation(fields: [".concat(field.relationToFields
                    .map(function (f) { return "\"".concat(f, "\""); })
                    .join(", "), "])")
                : "").concat(field.relationToReferences
                ? " @relation(references: [".concat(field.relationToReferences
                    .map(function (f) { return "\"".concat(f, "\""); })
                    .join(", "), "])")
                : "").concat(field.relationOnDelete
                ? " @relation(onDelete: ".concat(field.relationOnDelete, ")")
                : "").concat(field.default !== undefined ? " @default(".concat(field.default, ")") : "", "\n");
        }
        prismaSchema += "}\n\n";
    }
    return prismaSchema;
}
// Function to read JSON file and generate Prisma schema
function generatePrismaSchemaFromFile(filePath) {
    // Read JSON file
    fs.readFile(filePath, "utf8", function (err, data) {
        if (err) {
            console.error("Error reading JSON file:", err);
            return;
        }
        try {
            // Parse JSON data
            var schema = JSON.parse(data);
            // Generate Prisma schema
            var prismaSchema = generatePrismaSchema(schema);
            // Write Prisma schema to file
            fs.writeFile("prisma.schema", prismaSchema, function (err) {
                if (err) {
                    console.error("Error writing Prisma schema:", err);
                }
                else {
                    console.log("Prisma schema generated successfully!");
                }
            });
        }
        catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });
}
// Check if file address is provided as argument
if (process.argv.length < 3) {
    console.error("Please provide the file address as an argument.");
    process.exit(1);
}
var filePath = process.argv[2];
// Generate Prisma schema from file
generatePrismaSchemaFromFile(filePath);
