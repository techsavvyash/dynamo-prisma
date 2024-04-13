"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fileExists_1 = require("../src/fileExists");
var jsonData = {
    schema: [
        {
            schemaName: "User",
            fields: [
                {
                    fieldName: "user Id",
                    type: "String",
                    description: "ID of the user",
                    maxLength: null,
                    default: null,
                    nullable: false,
                    unique: false,
                    isId: true,
                    uuid: true,
                },
                {
                    fieldName: "username",
                    type: "String",
                    description: "Username of the user",
                    maxLength: null,
                    default: null,
                    nullable: false,
                    unique: true,
                },
                {
                    fieldName: "email",
                    type: "String",
                    description: "Email of the user",
                    maxLength: null,
                    default: null,
                    nullable: false,
                    unique: true,
                },
                {
                    fieldName: "type",
                    type: "String",
                    description: "Type of the user",
                    maxLength: null,
                    default: null,
                    nullable: false,
                    unique: false,
                },
                {
                    fieldName: "password",
                    type: "String",
                    description: "Password of the user",
                    maxLength: null,
                    default: null,
                    nullable: false,
                    unique: false,
                },
                {
                    fieldName: "posts",
                    type: "Post",
                    description: "Posts authored by the user",
                    maxLength: null,
                    default: null,
                    nullable: true,
                    unique: false,
                },
            ],
            description: "User model",
        },
    ],
};
var output = (0, fileExists_1.generatePrismaSchema)(jsonData);
console.log(output);
