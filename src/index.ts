import { outputFileSync } from "fs-extra";
import { getProto2ApiData } from "./proto";
import { success } from "./utils";
import { genCode } from "./genTsApi";
import { Swagger } from "swagger/interface";
import { getSwagger2ApiData } from "./swagger";
export interface Options {
  files: string[]; // proto file
  output: string;
  type: "proto" | "swagger";
  protoDir?: string; // proto dir
  swaggerData: Swagger;
  apiName: string;
  apiPath: string;
  apiPrefixPath: string;
  ignore?: RegExp; // ignore
}

export function main(options: Options) {
  let apiFileMap, result;
  if (options.type === "swagger") {
    apiFileMap = getSwagger2ApiData(options);
  } else {
    apiFileMap = getProto2ApiData(options);

    result = genCode({
      apiFileMap,
      apiName: options.apiName,
      apiPath: options.apiPath,
      apiPrefixPath: options.apiPrefixPath,
    });
  }

  for (const filePath in result) {
    outputFileSync(filePath, result[filePath], "utf8");
    success(`${filePath} generated successfully`);
    console.log();
  }
}
