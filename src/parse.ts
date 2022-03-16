import protoJs from "protobufjs";
import { outputFileSync, existsSync } from "fs-extra";

import { resolve } from "path";

import { ApiFile } from "./apiInterface";

import {
  isEnum,
  isType,
  isNamespace,
  isService,
  findOrInsertParentInterfaceByName,
  typeFiledToInterface,
  enumFiledToEnum,
  serviceFiledToApiFunction,
} from "./core";
import { genFileMapData } from "./genTsApi";

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

  const walkTree = (item: protoJs.Root) => {
    if (item.nested) {
      Object.keys(item.nested).forEach((key) => {
        walkTree(item.nested[key] as protoJs.Root);
      });
    }
    // 过滤非common 的item
    if (item.filename) {
      isType(item) && walkType(item as any, apiFileMap[item.filename]);
      isEnum(item) && walkEnum(item as any, apiFileMap[item.filename]);
      isService(item) && walkService(item as any, apiFileMap[item.filename]);
    }
  };
  // outputFileSync("root.json", JSON.stringify(root.nested, null, 4));
  walkTree(root);
  const result = genFileMapData(
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

export function walkEnum(item: protoJs.Enum, apiFile: ApiFile) {
  const _enum = enumFiledToEnum(item);
  const { parent } = item;
  // 说明是内嵌的enum，则该enum需要定义在parent 的module内
  if (isType(parent)) {
    const parentInterface = findOrInsertParentInterfaceByName(
      apiFile,
      parent.name,
      parent.comment
    );
    parentInterface.module.enums.push(_enum);
  }

  if (isNamespace(parent)) {
    const index = apiFile.interfaces.findIndex((k) => k.name === item.name);
    if (index === -1) {
      apiFile.enums.push(_enum);
    } else {
      apiFile.enums[index] = _enum;
    }
  }
}

export function walkService(item: protoJs.Service, apiFile: ApiFile) {
  const apiModule = serviceFiledToApiFunction(item);
  apiFile.apiModules.push(apiModule);
}

export function walkType(item: protoJs.Type, apiFile: ApiFile) {
  const { parent } = item;
  const _interface = typeFiledToInterface(item);
  // 说明是内嵌的message，则该interface需要定义在parent 的module内
  if (isType(parent)) {
    const parentInterface = findOrInsertParentInterfaceByName(
      apiFile,
      parent.name,
      parent.comment
    );
    parentInterface.module.interfaces.push(_interface);
  }

  if (isNamespace(parent)) {
    const index = apiFile.interfaces.findIndex((k) => k.name === item.name);
    if (index === -1) {
      apiFile.interfaces.push(_interface);
    } else {
      apiFile.interfaces[index].members = _interface.members;
    }
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
