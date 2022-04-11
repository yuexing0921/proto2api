import { ApiFile } from "apiInterface";
import { Options } from "../index";
import { SchemaType } from "./interface";

const mainFilePathName = "/api.ts";

export function getSwagger2ApiData(options: Options) {
  const apiFileMap: { [fileName: string]: ApiFile } = {};
  apiFileMap[options.output + mainFilePathName] = {
    path: options.output + mainFilePathName,
    comment: "",
    imports: [],
    enums: [],
    interfaces: [],
    apiModules: [],
    apiPrefixPath: options.apiPrefixPath,
  };
  const visitSchemaType = (item: SchemaType) => {
    if(item.)
  };
  return apiFileMap;
}
