"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var prisma_schema_dsl_1 = require("prisma-schema-dsl");
var prisma_schema_dsl_types_1 = require("prisma-schema-dsl-types");
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
            var jsonData = JSON.parse(data);
            // Create models array
            var models = [];
            for (var key in jsonData.schema) {
                if (jsonData.schema.hasOwnProperty(key)) {
                    var schemaItem = jsonData.schema[key];
                    var fields = [];
                    for (var fieldKey in schemaItem.fields) {
                        if (schemaItem.fields.hasOwnProperty(fieldKey)) {
                            var fieldData = schemaItem.fields[fieldKey];
                            fields.push((0, prisma_schema_dsl_1.createScalarField)(fieldData.fieldName, fieldData.type, false, //isList boolean | undefined
                            !fieldData.nullable, //isRequired boolean | undefined
                            fieldData.unique, undefined, // isId boolean | undefined
                            undefined, // isUpdatedAt  boolean | undefined
                            fieldData.default, // default values SaclarFeildDefault | undefined
                            undefined, // documentation string | undefined
                            undefined, // isForeignKey boolean | undefined
                            undefined // attributes in string | string[] | undefined
                            ));
                        }
                    }
                    models.push((0, prisma_schema_dsl_1.createModel)(schemaItem.schemaName, fields));
                }
            }
            var DataSource = (0, prisma_schema_dsl_1.createDataSource)("db", prisma_schema_dsl_types_1.DataSourceProvider.PostgreSQL, "localhost");
            // Create Prisma schema
            var schema = (0, prisma_schema_dsl_1.createSchema)(models, [], DataSource, []);
            // Print Prisma schema
            (0, prisma_schema_dsl_1.print)(schema).then(function (prismaSchema) {
                fs.mkdirSync("./prisma", { recursive: true });
                fs.writeFile("./prisma/schema.prisma", prismaSchema, function (err) {
                    if (err) {
                        console.error("Error writing Prisma schema:", err);
                    }
                    else {
                        console.log("Prisma schema generated successfully!");
                    }
                });
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
