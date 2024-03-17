"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
var fileExists_1 = require("./fileExists");
function main(argv) {
    console.warn(argv);
    if (argv.length < 3) {
        console.error("Please provide the file address as an argument.");
        process.exit(1);
    }
    var filePath = argv[2];
    (0, fileExists_1.GenerateSchemaFile)(filePath);
    return filePath;
}
exports.main = main;
main(process.argv);
