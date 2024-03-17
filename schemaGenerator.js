"use strict";
// ! if prisma.schema exists, then appends after last model
// ? Partially implemented TODO: add secondary parser, to test for any possible bugs and recommend solutions, like automincement: true, type: int only.. so on..
// DONE TODO: if foreign key is false, type != anyModelType
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFields = exports.createModels = void 0;
var prisma_schema_dsl_1 = require("prisma-schema-dsl");
var prisma_schema_dsl_types_1 = require("prisma-schema-dsl-types");
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
        fieldData.type, fieldData.isList, //isList boolean | undefined
        !fieldData.nullable || false, //isRequired boolean | undefined
        fieldData.isId ? fieldData.isId : fieldData.unique || false, fieldData.isId || false, undefined, // isUpdatedAt
        fieldData.isId && fieldData.autoincrement
            ? { callee: prisma_schema_dsl_types_1.AUTO_INCREMENT }
            : fieldData.isId && fieldData.uuid
                ? { callee: prisma_schema_dsl_types_1.UUID }
                : fieldData.default, // default values SaclarFeildDefault | undefined
        undefined, // documentation string | undefined
        fieldData.isForeignKey, // isForeignKey boolean | undefined
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
