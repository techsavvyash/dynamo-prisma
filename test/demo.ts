import { generatePrismaSchema } from "../src/fileExists";
import { Schema } from "../src/types.dynamoPrisma";

const jsonData: Schema = {
  schema: [
    {
      schemaName: "User",
      fields: [
        {
          fieldName: "id",
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

const output = generatePrismaSchema(jsonData);

console.log(output);
