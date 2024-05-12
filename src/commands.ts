/**
 * @description This file contains functions that are used to run the prisma CLI commands
 */

import { exec, spawn } from "child_process";

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const spawnedProcess = spawn(command, args, { stdio: "inherit" }); // Enable shell mode for complex commands like npx

    // Handle process completion
    spawnedProcess.on("close", (code) => {
      if (code === 0) {
        resolve(code); // Resolve the promise if the command was successful
      } else {
        reject(
          new Error(
            `Command failed with code ${code}: ${command} ${args.join(" ")}`
          )
        );
      }
    });
  });
}

export function runPrismaDBPull() {
  exec("npx prisma db pull", (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing "npx prisma db pull"', error);
      throw new Error(
        JSON.stringify({
          error: true,
          message: `Error while performing npx prisma db pull ${error}`,
        })
      );
    }
    console.log(
      "🚀 Prisma schema has been populated with old tables fetched from the database"
    );
    return {
      status: true,
      message:
        "Prisma schema has been populated with old tables fetched from the database.",
    };
  });
}

export function runPrismaFormat() {
  return runCommand("npx", ["prisma", "format"])
    .then(() => {
      console.log("Prisma schema has been formatted successfully.");
      return {
        status: true,
        message: "Prisma schema has been formatted successfully.",
      };
    })
    .catch((error) => {
      console.error("An error occurred:", error);
      throw new Error(
        JSON.stringify({
          error: true,
          message: `Error formatting Prisma schema: ${error}`,
        })
      );
    });
}

export function runPrismaValidate() {
  return runCommand("npx", ["prisma", "validate"])
    .then(() => {
      console.log("Prisma schema is valid.");
      return {
        status: true,
        message: "Prisma schema is valid.",
      };
    })
    .catch((error) => {
      console.error("An error occurred:", error);
      throw new Error(
        JSON.stringify({
          error: true,
          message: `Error validating Prisma schema: ${error}`,
        })
      );
    });
}

export function createMigrations(migrateModels) {
  return runCommand("npx", [
    "prisma",
    "migrate",
    "dev",
    "--name",
    `${Date.now()}_dynamo_prisma_` + migrateModels.join("_"),
    "--create-only",
  ])
    .then(() => {
      console.log("Migrations have been generated successfully.");
      return {
        status: true,
        message: "Migrations have been generated successfully.",
      };
    })
    .catch((error) => {
      console.error("An error occurred:", error);
      throw new Error(
        JSON.stringify({
          error: true,
          message: `Error applying migrations: ${error}`,
        })
      );
    });
}

export function applyMigrations() {
  return runCommand("npx", ["prisma", "migrate", "deploy"])
    .then(() => {
      console.log("Migrations have been successfully deployed.");
      return {
        status: true,
        message: "Migrations have been successfully deployed.",
      };
    })
    .catch((error) => {
      console.error("An error occurred:", error);
      throw new Error(
        JSON.stringify({
          error: true,
          message: `Error applying migrations: ${error}`,
        })
      );
    });
}

export function validateAndMigrate(migrateModels: string[]) {
  console.log("migrateModels: ", migrateModels);
  return runCommand("npx", ["prisma", "validate"])
    .then(() => {
      console.log("Prisma schema is valid.");

      return runCommand("npx", [
        "prisma",
        "migrate",
        "dev",
        "--name",
        `${Date.now()}_dynamo_prisma_` + migrateModels.join("_"),
        "--create-only",
      ]);
    })
    .then(() => {
      console.log("Migration files created successfully.");
      return runCommand("npx", ["prisma", "migrate", "deploy"]);
    })
    .then(() => {
      console.log("Migrations have been successfully deployed.");
      return {
        status: true,
        message: "migrations applied and generated successfully",
      };
    })
    .catch((error) => {
      console.error("An error occurred:", error);
      throw new Error(
        JSON.stringify({
          error: true,
          message: `Error validating and migrating Prisma schema: ${error}`,
        })
      );
    });
}
