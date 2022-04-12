import { outputFileSync } from "fs-extra";
import { getProto2ApiData } from "./proto";
import { success } from "./utils";
import { genCode } from "./genTsApi";
export * from "./proto";
export * from "./apiInterface";
export * from "./proto/core";
export * from "./genTsApi";
export * from "./utils";

export interface Options {
  files: string[]; // proto file
  output: string;
  protoDir?: string; // proto dir
  apiName: string;
  apiPath: string;
  apiPrefixPath: string;
  depPath: string;
  ignore?: RegExp; // ignore
}

export function main(options: Options) {
  const apiFileMap = getProto2ApiData(options);

  const result = genCode({
    apiFileMap,
    apiName: options.apiName,
    apiPath: options.apiPath,
    apiPrefixPath: options.apiPrefixPath,
  });

  for (const filePath in result) {
    outputFileSync(filePath, result[filePath], "utf8");
    success(`${filePath} generated successfully`);
    console.log();
  }
}
