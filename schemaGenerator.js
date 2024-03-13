"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFields = exports.createModels = exports.readJsonFile = exports.generatePrismaSchemaFromFile = void 0;
var fs = require("fs");
var prisma_schema_dsl_1 = require("prisma-schema-dsl");
var prisma_schema_dsl_types_1 = require("prisma-schema-dsl-types");
function generatePrismaSchemaFromFile(filePath) {
    console.warn("File path: ", filePath);
    readJsonFile(filePath)
        .then(function (jsonData) {
        var models = createModels(jsonData.schema);
        console.warn("Model generated");
        // console.log(models);
        var DataSource = (0, prisma_schema_dsl_1.createDataSource)("db", prisma_schema_dsl_types_1.DataSourceProvider.PostgreSQL, "localhost");
        console.warn("DataSource generated");
        // console.log(DataSource);
        var schema = (0, prisma_schema_dsl_1.createSchema)(models, [], DataSource, []);
        console.warn("schema generated");
        // console.log(schema);
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
    })
        .catch(function (error) {
        console.error("Error parsing JSON:", error);
    });
}
exports.generatePrismaSchemaFromFile = generatePrismaSchemaFromFile;
function readJsonFile(filePath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, "utf8", function (err, data) {
            if (err) {
                console.error("Failed to read File. ERROR: ", err);
                reject(err);
                return;
            }
            try {
                var jsonData = JSON.parse(data);
                console.log(jsonData);
                resolve(jsonData);
            }
            catch (error) {
                console.error("Failed to parse. ERROR: ", err);
                reject(error);
            }
        });
    });
}
exports.readJsonFile = readJsonFile;
function createModels(schema) {
    var models = [];
    for (var key in schema) {
        if (schema.hasOwnProperty(key)) {
            var schemaItem = schema[key];
            var fields = createFields(schemaItem.fields);
            models.push((0, prisma_schema_dsl_1.createModel)(schemaItem.schemaName, fields));
        }
    }
    return models;
}
exports.createModels = createModels;
function createFields(fields) {
    // console.error("Feilds: ", fields);
    var result = [];
    for (var fieldKey in fields) {
        if (fields.hasOwnProperty(fieldKey)) {
            var fieldData = fields[fieldKey];
            result.push((0, prisma_schema_dsl_1.createScalarField)(fieldData.fieldName, fieldData.type, false, //isList boolean | undefined
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
    // console.log("Results: ", result);
    return result;
}
exports.createFields = createFields;
