import { Schema, createFields } from "../src/schemaGenerator";
import * as fs from "fs";

// describe("createFields", () => {
//   it("should create an array of fields based on the input", () => {
//     const expectedFields = [
//       {
//         name: "id",
//         isList: false,
//         isRequired: true,
//         isUnique: true,
//         kind: "scalar",
//         type: "String",
//         isId: false,
//         isUpdatedAt: false,
//         default: null,
//         documentation: undefined,
//         isForeignKey: false,
//         attributes: null,
//       },
//       {
//         name: "content",
//         isList: false,
//         isRequired: true,
//         isUnique: false,
//         kind: "scalar",
//         type: "String",
//         isId: false,
//         isUpdatedAt: false,
//         default: null,
//         documentation: undefined,
//         isForeignKey: false,
//         attributes: null,
//       },
//       {
//         name: "author",
//         isList: false,
//         isRequired: true,
//         isUnique: false,
//         kind: "scalar",
//         type: "User",
//         isId: false,
//         isUpdatedAt: false,
//         default: null,
//         documentation: undefined,
//         isForeignKey: false,
//         attributes: null,
//       },
//       {
//         name: "post",
//         isList: false,
//         isRequired: true,
//         isUnique: false,
//         kind: "scalar",
//         type: "Post",
//         isId: false,
//         isUpdatedAt: false,
//         default: null,
//         documentation: undefined,
//         isForeignKey: false,
//         attributes: null,
//       },
//     ];

//     const fields = {
//       id: {
//         fieldName: "id",
//         type: "String",
//         description: "ID of the comment",
//         maxLength: null,
//         default: null,
//         nullable: false,
//         unique: true,
//         vectorEmbed: false,
//         embeddingAlgo: "",
//       },
//       content: {
//         fieldName: "content",
//         type: "String",
//         description: "Content of the comment",
//         maxLength: null,
//         default: null,
//         nullable: false,
//         unique: false,
//         vectorEmbed: false,
//         embeddingAlgo: "",
//       },
//       author: {
//         fieldName: "author",
//         type: "User",
//         description: "Author of the comment",
//         maxLength: null,
//         default: null,
//         nullable: false,
//         unique: false,
//         vectorEmbed: false,
//         embeddingAlgo: "",
//       },
//       post: {
//         fieldName: "post",
//         type: "Post",
//         description: "Post associated with the comment",
//         maxLength: null,
//         default: null,
//         nullable: false,
//         unique: false,
//         vectorEmbed: false,
//         embeddingAlgo: "",
//       },
//     };

//     expect(createFields(fields)).toEqual(expectedFields);
//   });
// });

// TODO: testcase => should read and parse the JSON file
/*
readJsonFile(filePath).then((returnedJsonData: Schema) => {
       expect(returnedJsonData).toBe(jsonData);
     });
*/
