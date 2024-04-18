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

export function runDBPull() {
  exec("npx prisma db pull", (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing "npx prisma db pull"', error);
      return;
    }
    console.log("Prisma migrations fetched from the database.");
  });
}

export function validateAndMigrate(migrateModels: string[]) {
  console.log("migrateModels: ", migrateModels);
  runCommand("npx", ["prisma", "validate"])
    .then(() => {
      console.log("Prisma schema is valid.");

      return runCommand("npx", [
        "prisma",
        "migrate",
        "dev",
        "--name",
        ...migrateModels,
        "--create-only",
      ]);
    })
    .then(() => {
      console.log("Migration files created successfully.");
      return runCommand("npx", ["prisma", "migrate", "deploy"]);
    })
    .then(() => {
      console.log("Migrations have been successfully deployed.");
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });

  return {
    status: true,
    message: "migrations applied and generated successfully",
  };
}
