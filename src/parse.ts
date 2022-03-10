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

export class WalkProto {
  opts: Options;

  private apiFileMap: { [fileName: string]: ApiFile } = {};

  private protoFiles: string[] = [];

  private apiDir: string = "";

  constructor(options: Options) {
    this.protoFiles = options.files;
    this.opts = options;
    this.apiDir = options.protoDir;
  }

  private walkEnum(item: protoJs.Enum) {
    const apiFile = this.apiFileMap[item.filename];
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

  private walkService(item: protoJs.Service) {
    const apiFile = this.apiFileMap[item.filename];
    const apiModule = serviceFiledToApiFunction(item);
    apiFile.apiModules.push(apiModule);
  }

  private walkType(item: protoJs.Type) {
    const apiFile = this.apiFileMap[item.filename];

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

  // core
  private walkTree(item: protoJs.Root): void {
    if (item.nested) {
      Object.keys(item.nested).forEach((key) => {
        this.walkTree(item.nested[key] as protoJs.Root);
      });
    }
    // 过滤非common 的item
    if (item.filename) {
      isType(item) && this.walkType(item as any);
      isEnum(item) && this.walkEnum(item as any);
      isService(item) && this.walkService(item as any);
    }
  }

  private parse(): void {
    const root = new protoJs.Root();

    // 对import的文件进行解析，获取绝对路径
    root.resolvePath = (origin, target) => {
      if (root.nested && root.files.length > 0 && !this.apiDir) {
        const keys = Object.keys(root.nested);
        const firstPath = root.files[0];
        this.apiDir = firstPath.slice(0, firstPath.indexOf(keys[0]));
      }

      let file;

      if (existsSync(target)) {
        file = target;
      } else {
        file = resolve(this.apiDir, target);
      }

      this.apiFileMap[file] = {
        path: "",
        comment: "",
        imports: [],
        enums: [],
        interfaces: [],
        apiModules: [],
      };
      return file;
    };

    root
      .loadSync(this.protoFiles, {
        keepCase: true,
        alternateCommentMode: true,
      })
      .resolveAll();

    this.walkTree(root);
    // outputFileSync("root.json", JSON.stringify(root.nested, null, 4));
  }

  private genFile() {
    const result = genFileMapData(
      this.apiFileMap,
      this.apiDir,
      this.opts.output,
      this.opts.apiName || "webapi",
      this.opts.apiPath || "~/utils/webapi"
    );

    for (const filePath in result) {
      outputFileSync(filePath, result[filePath], "utf8");
    }
  }
  public run() {
    this.parse();
    this.genFile();
  }
}
