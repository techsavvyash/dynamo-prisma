"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonChecks = void 0;
function JsonChecks(jsonData) {
    var enumNames = jsonData.enum.map(function (enums) { return enums.name.toLowerCase(); }) || [];
    var models = jsonData.schema.map(function (model) {
        return model.schemaName.toLowerCase();
    });
    enumNames.push.apply(enumNames, __spreadArray(["string",
        "int",
        "float",
        "boolean",
        "datetime",
        "json"], models, false));
    var fieldCounts = {};
    if (!hasNoDuplicates(models)) {
        console.log("Duplicates found");
        process.exit(1);
    }
    // Check if the autoincrement | uuid is true, and type to be appropiate
    jsonData.schema.forEach(function (model) {
        model.fields.forEach(function (field) {
            if (field.autoincrement && field.uuid) {
                console.error("".concat(field.fieldName, " in model ").concat(model.schemaName, " cannot be both autoincrement and uuid"));
                process.exit(1);
            }
            //   if (field.autoincrement && field.type !== "Int") {
            //     console.log(
            //       `Autoincrement field ${field.fieldName} in model ${model.schemaName} is not of type Int`
            //     );
            //     console.log("Convert it to int? (true / false) (default: false)");
            //     process.stdin.once("data", (input) => {
            //       const convertToInt = input.toString().trim().toLowerCase() === "true";
            //       if (!convertToInt) {
            //         process.exit(1);
            //       }
            //       console.log("Converting to Int...");
            //     });
            //   }
            //   if (field.uuid && field.type !== "String") {
            //     console.log(
            //       `UUID field ${field.fieldName} in model ${model.schemaName} is not of type String`
            //     );
            //     process.exit(1);
            //   }
            if (field.autoincrement && field.type !== "Int") {
                console.log("Autoincrement field ".concat(field.fieldName, " in model ").concat(model.schemaName, " is not of type Int"));
                process.exit(1);
            }
            if (field.uuid && field.type !== "String") {
                console.log("UUID field ".concat(field.fieldName, " in model ").concat(model.schemaName, " is not of type String"));
                process.exit(1);
            }
        });
    });
    // check if foreign key is false, and type is not equal to String, Int, Float, Boolean, DateTime, Json
    jsonData.schema.forEach(function (model) {
        model.fields.forEach(function (field) {
            if (!field.isForeignKey) {
                if (!__spreadArray([], enumNames, true).includes(field.type.toLowerCase())) {
                    console.error("".concat(field.fieldName, " in model ").concat(model.schemaName, " is not a foreign key and is not of type String, Int, Float, Boolean, DateTime, Json"));
                    console.error("model: ", field);
                    process.exit(1);
                }
            }
        });
    });
}
exports.JsonChecks = JsonChecks;
function hasNoDuplicates(result) {
    var seen = {};
    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
        var item = result_1[_i];
        if (seen[item.toLowerCase()]) {
            return false;
        }
        seen[item.toLowerCase()] = true;
    }
    return true;
}
