// import { execSync } from 'child_process'
import { Command } from "commander";

const program = new Command();

export const parseCommand = (args: string[]) => {
  return new Promise(async (res, rej) => {
    try {
      program
        .version(require("../package.json").version)
        .option("-d, --debug", "Load code with ts-node for debug");

      program.parse(args);
    } catch (err) {
      console.log(err);
      rej(err);
    }
  });
};
