import protoJs from "protobufjs";
import { outputFileSync, existsSync } from "fs-extra";

import { resolve } from "path";

import { ApiFile } from "./apiInterface";

import {
  isEnum,
  isType,
  isService,
  typeGenInterface,
  typeGenInterfaceModule,
  enumGenEnum,
  serviceGenApiFunction,
  interfaceGenImport,
} from "./core";
import { pbDataGenApiData } from "./genTsApi";

export interface Options {
  files: string[]; // proto file
  output: string;
  protoDir?: string; // proto dir
  apiName?: string;
  apiPath?: string;
}

export function run(options: Options) {
  const apiFileMap: { [fileName: string]: ApiFile } = {};

  const { apiDir, root, pbFilesPath } = parseProto(options.files);
  pbFilesPath.forEach((file) => {
    apiFileMap[file] = {
      path: "",
      comment: "",
      imports: [],
      enums: [],
      interfaces: [],
      apiModules: [],
    };
  });

  const visitRoot = (item: protoJs.Root) => {
    if (item.nested && !isType(item)) {
      // Do not filter deeply nested
      Object.keys(item.nested).forEach((key) => {
        visitRoot(item.nested[key] as protoJs.Root);
      });
    }
    if (item.filename) {
      const apiFile = apiFileMap[item.filename];
      // Generate corresponding data for service
      if (isService(item)) {
        apiFile.apiModules.push(serviceGenApiFunction(item as any));
      }
      // Generate corresponding data for enum
      if (isEnum(item)) {
        apiFile.enums.push(enumGenEnum(item as any));
      }
      //  Generate corresponding data for message
      if (isType(item)) {
        const _interface = typeGenInterface(item as any);
        if ((item as any).nested) {
          _interface.module = typeGenInterfaceModule(item as any);
        }
        apiFile.interfaces.push(_interface);

        //  Generate corresponding data for imports
        interfaceGenImport(_interface, apiFile.imports);
      }
    }
  };
  // outputFileSync("root.json", JSON.stringify(root.nested, null, 4));
  visitRoot(root);

  const result = pbDataGenApiData(
    apiFileMap,
    apiDir,
    options.output,
    options.apiName,
    options.apiPath
  );

  for (const filePath in result) {
    outputFileSync(filePath, result[filePath], "utf8");
  }
}

export function parseProto(protoFiles: string[]) {
  const root = new protoJs.Root();
  let apiDir = "";
  const pbFilesPath = [];

  // Parse the imported PB to get the absolute path
  root.resolvePath = (origin, target) => {
    if (root.nested && root.files.length > 0 && !apiDir) {
      const keys = Object.keys(root.nested);
      const firstPath = root.files[0];
      apiDir = firstPath.slice(0, firstPath.indexOf(keys[0]));
    }

    let file;

    if (existsSync(target)) {
      file = target;
    } else {
      file = resolve(apiDir, target);
    }
    pbFilesPath.push(file);
    return file;
  };

  root
    .loadSync(protoFiles, {
      keepCase: true,
      alternateCommentMode: true,
    })
    .resolveAll();

  return {
    root,
    apiDir,
    pbFilesPath,
  };
}
