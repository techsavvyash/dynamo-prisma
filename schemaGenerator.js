"use strict";
// TODO: add secondary parser, to test for any possible bugs and recommend solutions, like automincement: true, type: int only.. so on..
// TODO: if foreign key is false, type != anyModelType
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFields = exports.createModels = exports.readJsonFile = exports.generatePrismaSchemaFromFile = void 0;
var fs = require("fs");
var prisma_schema_dsl_1 = require("prisma-schema-dsl");
var prisma_schema_dsl_types_1 = require("prisma-schema-dsl-types");
function generatePrismaSchemaFromFile(filePath) {
    var _this = this;
    console.warn("File path: ", filePath);
    readJsonFile(filePath)
        .then(function (jsonData) { return __awaiter(_this, void 0, void 0, function () {
        var models, DataSource, result, Generator, Enum, schema, schemaString;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    models = createModels(jsonData.schema);
                    console.log("Model generated");
                    DataSource = "datasource db {\nprovider = \"postgresql\"\nurl      = env(\"DATABASE_URL\")\n}";
                    Generator = (0, prisma_schema_dsl_1.createGenerator)(jsonData.generator ? jsonData.generator.generatorName : "client", jsonData.generator ? jsonData.generator.provider : "prisma-client-js", jsonData.generator ? jsonData.generator.output : undefined, // can be null | undefined | string( // ? Example Value: "node_modules/@prisma/client")
                    jsonData.generator ? jsonData.generator.binaryTargets : undefined // can be null | undefined | string[]
                    );
                    Enum = jsonData.enum;
                    schema = (0, prisma_schema_dsl_1.createSchema)(models, Enum, undefined, [Generator]);
                    return [4 /*yield*/, (0, prisma_schema_dsl_1.print)(schema)];
                case 1:
                    schemaString = _a.sent();
                    result = DataSource + "\n" + schemaString;
                    console.log(result);
                    console.warn("schema generated");
                    // console.log(schema);
                    (0, prisma_schema_dsl_1.print)(schema).then(function (prismaSchema) {
                        fs.mkdirSync("./prisma", { recursive: true });
                        fs.writeFile("./prisma/schema.prisma", result, function (err) {
                            if (err) {
                                console.error("Error writing Prisma schema:", err);
                            }
                            else {
                                console.log("Prisma schema generated successfully!");
                            }
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); })
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
        fieldData.isId && fieldData.autoincrement
            ? console.error("Cannot have String in autoincrement")
            : null;
        // TODO @db.Uuid if default is uuid, and isId is true
        result.push((0, prisma_schema_dsl_1.createScalarField)(fieldData.fieldName, 
        // fieldData.type as ScalarType
        //
        //   : fieldData.isId && fieldData.uuid
        //   ? ScalarType.String
        //   :
        fieldData.type, false, //isList boolean | undefined
        !fieldData.nullable, //isRequired boolean | undefined
        fieldData.isId ? fieldData.isId : fieldData.unique, fieldData.isId, undefined, // isUpdatedAt
        fieldData.isId && fieldData.autoincrement
            ? { callee: prisma_schema_dsl_types_1.AUTO_INCREMENT }
            : fieldData.isId && fieldData.uuid
                ? { callee: prisma_schema_dsl_types_1.UUID }
                : fieldData.default, // default values SaclarFeildDefault | undefined
        undefined, // documentation string | undefined
        // fieldData.isForeignKey, // isForeignKey boolean | undefined
        undefined, // isForeignKey boolean | undefined
        undefined // attributes in string | string[] | undefined
        ));
        if (fieldData.vectorEmbed) {
            result.push((0, prisma_schema_dsl_1.createScalarField)("".concat(fieldData.fieldName, "Algorithm"), "String", false, true, false, false, undefined, "\"".concat(fieldData.embeddingAlgo, "\""), undefined, undefined, undefined), (0, prisma_schema_dsl_1.createScalarField)("".concat(fieldData.fieldName, "Embedding"), "Unsupported(\"vector(".concat(fieldData.embeddingAlgo.length, ")\")"), false, true, false, false, undefined, undefined, undefined, undefined, undefined));
        }
    }
    // console.log("Results: ", result);
    return result;
}
exports.createFields = createFields;
