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
        var _a, _b, _c;
        var models = createModels(jsonData.schema);
        console.log("Model generated");
        // console.log(models);
        // console.warn(
        //   "URL is ENV",
        //   isDataSourceURLEnv(jsonData.dataSource!.urlEnv)
        // );           // ! COMES OUT FALSE
        var DataSource = (0, prisma_schema_dsl_1.createDataSource)(((_a = jsonData.dataSource) === null || _a === void 0 ? void 0 : _a.name) ? jsonData.dataSource.name : "db", ((_b = jsonData.dataSource) === null || _b === void 0 ? void 0 : _b.provider)
            ? jsonData.dataSource.provider
            : prisma_schema_dsl_types_1.DataSourceProvider.PostgreSQL, ((_c = jsonData.dataSource) === null || _c === void 0 ? void 0 : _c.url)
            ? jsonData.dataSource.url.url
                ? jsonData.dataSource.url.url
                : // : (env(`${jsonData.dataSource!.url.fromEnv}"`) as unknown as string)
                    "".concat(jsonData.dataSource.url.fromEnv)
            : "localhost");
        console.log("DataSource generated");
        // console.log(DataSource);
        var Generator = (0, prisma_schema_dsl_1.createGenerator)("client", "prisma-client-js");
        // const Generator = `
        // generator ${jsonData.generator?.generatorName} {
        //   ${
        //     jsonData.generator?.fields.length
        //       ? jsonData.generator!.fields.map(
        //           (field) => "field.name = field.attrib"
        //         )
        //       : 'provider      = "prisma-client-js"'
        //   }
        // }
        // `;
        var Enum = jsonData.enum;
        var schema = (0, prisma_schema_dsl_1.createSchema)(models, Enum, DataSource, [Generator]);
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
    for (var _i = 0, schema_1 = schema; _i < schema_1.length; _i++) {
        var schemaItem = schema_1[_i];
        var fields = createFields(schemaItem.fields);
        models.push((0, prisma_schema_dsl_1.createModel)(schemaItem.schemaName, fields));
    }
    return models;
}
exports.createModels = createModels;
// increment is breaking the code
// ! ERROR: Error parsing JSON: Error: Default must be a number or call expression to autoincrement()
// ? Log by console.war:
/*  String;
    Default
    Default
    Default
    Default
    Default
    Int
*/
function createFields(fields) {
    // console.error("Feilds: ", fields);
    var result = [];
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
        var fieldData = fields_1[_i];
        console.warn(fieldData.isId && fieldData.autoincrement
            ? prisma_schema_dsl_types_1.ScalarType.Int
            : fieldData.isId && fieldData.uuid
                ? prisma_schema_dsl_types_1.ScalarType.String
                : "Default");
        result.push((0, prisma_schema_dsl_1.createScalarField)(fieldData.fieldName, 
        // fieldData.type as ScalarType
        fieldData.isId && fieldData.autoincrement
            ? prisma_schema_dsl_types_1.ScalarType.Int
            : fieldData.isId && fieldData.uuid
                ? prisma_schema_dsl_types_1.ScalarType.String
                : fieldData.type, false, //isList boolean | undefined
        !fieldData.nullable, //isRequired boolean | undefined
        fieldData.isId ? fieldData.isId : fieldData.unique, fieldData.isId, undefined, // isUpdatedAt
        fieldData.isId && fieldData.autoincrement
            ? "autoincrement()"
            : fieldData.isId && fieldData.uuid
                ? "uuid()"
                : fieldData.default, // default values SaclarFeildDefault | undefined
        undefined, // documentation string | undefined
        undefined, // isForeignKey boolean | undefined
        undefined // attributes in string | string[] | undefined
        ));
        if (fieldData.vectorEmbed) {
            result.push((0, prisma_schema_dsl_1.createScalarField)("".concat(fieldData.fieldName, "Algorithm"), "String", false, true, false, false, undefined, "\"".concat(fieldData.embeddingAlgo, "\""), undefined, undefined, undefined), (0, prisma_schema_dsl_1.createScalarField)("".concat(fieldData.fieldName, "Embedding"), "Unsupported(\"vector[{".concat(fieldData.embeddingAlgo.length, "}]\")"), false, true, false, false, undefined, undefined, undefined, undefined, undefined));
        }
    }
    // console.log("Results: ", result);
    return result;
}
exports.createFields = createFields;
