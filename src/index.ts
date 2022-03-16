import { Options, run } from "./parse";
export * from "./parse";
export * from "./apiInterface";
export * from "./core";
export * from "./genTsApi";
export * from "./utils";

export function main(options: Options) {
  run(options);
}
