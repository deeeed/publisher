#!/usr/bin/env node
// packages/publisher/bin/publisher.ts
import { Command } from "commander";
import pkg from "../package.json";
import { changelogCommand } from "../src/commands/changelog";
import { initCommand } from "../src/commands/init";
import { integrityCommand } from "../src/commands/integrity";
import { releaseCommand } from "../src/commands/release";
import { validateCommand } from "../src/commands/validate";
import workspacesCommand from "../src/commands/workspaces";

const program = new Command();

program
  .name("publisher")
  .description("Monorepo release management tool")
  .version(pkg.version)
  .option(
    "--cwd <path>",
    "Working directory to run commands from",
    process.cwd(),
  )
  .option("--debug", "Enable debug logging", false);

// Add middleware to handle cwd and debug before any command execution
program.hook("preAction", (thisCommand) => {
  const options = thisCommand.opts<{ cwd: string; debug: boolean }>();

  // Handle cwd
  if (options.cwd) {
    process.chdir(options.cwd);
  }

  // Handle debug mode
  if (options.debug) {
    process.env.DEBUG = "true";
  }
});

program.addCommand(initCommand);
program.addCommand(releaseCommand);
program.addCommand(validateCommand);
program.addCommand(workspacesCommand);
program.addCommand(changelogCommand);
program.addCommand(integrityCommand);
program.parse(process.argv);
