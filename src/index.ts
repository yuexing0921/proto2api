import { run } from "./parseProto";
export * from "./parseProto";
export * from "./apiInterface";
export * from "./core";
export * from "./genTsApi";
export * from "./utils";

export interface Options {
  files: string[]; // proto file
  output: string;
  protoDir?: string; // proto dir
  apiName: string;
  apiPath: string;
  apiPrefixPath: string;
  ignore?: RegExp; // ignore
}

export function main(options: Options) {
  run(options);
}
