import protoJs from "protobufjs";
import { join } from "path";

import { ApiFile, DependencyType } from "../apiInterface";

import {
  isEnum,
  isType,
  isService,
  typeGenInterface,
  typeGenInterfaceModule,
  enumGenEnum,
  serviceGenApiFunction,
  insertImport,
} from "./core";
import {
  error,
  getRelativePathABDepth,
  log,
  recursionDirFindPath,
} from "../utils";
import { Options } from "../index";

export function getProto2ApiData(options: Options) {
  log("Loading PB file ......");
  const apiFileMap: { [fileName: string]: ApiFile } = {};

  const { root, pbPaths } = parseProto(options.files, options.depPath);
  for (const p of pbPaths) {
    if (options?.ignore?.test(p.target)) {
      continue;
    }
    apiFileMap[p.path] = {
      protoPath: p.path,
      protoTargetPath: p.target,
      outputPath: join(options.output, p.target).replace(".proto", ".ts"),
      comment: "",
      imports: [],
      enums: [],
      interfaces: [],
      apiModules: [],
      apiPrefixPath: options.apiPrefixPath,
    };
  }

  const visitRoot = (item: protoJs.Root) => {
    if (item.nested && !isType(item)) {
      // Do not filter deeply nested
      Object.keys(item.nested).forEach((key) => {
        visitRoot(item.nested[key] as protoJs.Root);
      });
    }
    const apiFile = apiFileMap[item.filename];
    if (item.filename && apiFile) {
      // Generate corresponding data for service
      if (isService(item)) {
        apiFile.apiModules.push(serviceGenApiFunction(item as any));
        apiFile.apiModules.forEach((k) =>
          k.functions.forEach((f) => {
            if (f.req.dependencyType === DependencyType.EXTERNAL) {
              insertImport(apiFile.imports, f.req);
            }
            if (f.res.dependencyType === DependencyType.EXTERNAL) {
              insertImport(apiFile.imports, f.res);
            }
          })
        );
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
        _interface.members.forEach((k) => {
          if (k.propertyType.dependencyType === DependencyType.EXTERNAL) {
            insertImport(apiFile.imports, k.propertyType);
          }
        });
        _interface.module?.interfaces?.forEach((i) => {
          i.members.forEach((k) => {
            if (k.propertyType.dependencyType === DependencyType.EXTERNAL) {
              insertImport(apiFile.imports, k.propertyType);
            }
          });
        });
      }
    }
  };
  // outputFileSync("root.json", JSON.stringify(root.nested, null, 4));
  visitRoot(root);
  log("Convert PB data to api data");
  return pathPreprocessing(
    {
      apiFileMap,
      output: options.output,
    },
    pbPaths
  );
}

export type PathPreprocessingOption = {
  apiFileMap: { [fileName: string]: ApiFile };
  output: string;
};
/**
 * Do some preprocessing on the pb path
 * @param options
 * @returns
 */
export function pathPreprocessing(
  options: PathPreprocessingOption,
  pbPaths: Array<{
    target: string;
    path: string;
  }>
): {
  [apiFilePath: string]: ApiFile;
} {
  const { apiFileMap } = options;

  for (const fileName in apiFileMap) {
    const apiFile = apiFileMap[fileName];

    apiFile.imports.forEach((k) => {
      if (k.resolvedPath) {
        const pathA = pbPaths
          .find((p) => p.path === k.resolvedPath)
          .target.replace(".proto", "");
        const pathB = apiFile.protoTargetPath.slice(
          0,
          apiFile.protoTargetPath.lastIndexOf("/")
        );
        k.moduleSpecifier = getRelativePathABDepth(pathA, pathB);
      }
    });

    apiFile.interfaces.forEach((inter) => {
      inter.members.forEach((mem) => {
        if (mem.propertyType.dependencyType === DependencyType.INLINE) {
          mem.propertyType.type = inter.name + "." + mem.propertyType.type;
        }
      });
    });
  }
  return apiFileMap;
}

export function parseProto(protoFiles: string[], dependencyPath: string) {
  const root = new protoJs.Root();
  let apiDir = "";
  const pbPaths: Array<{
    target: string;
    path: string;
  }> = [];
  const notFoundList = [];
  // Parse the imported PB to get the absolute path
  root.resolvePath = (origin, target) => {
    if (root.nested && root.files.length > 0 && !apiDir) {
      const keys = Object.keys(root.nested);
      const firstPath = root.files[0];
      apiDir = firstPath.slice(0, firstPath.indexOf(keys[0]));
    }

    let pathObj = {
      path: target,
      target,
    };

    if (target.match(/^google/)) {
      pathObj = recursionDirFindPath(process.cwd() + "/common", target);
    } else {
      pathObj = recursionDirFindPath(apiDir, target);
    }

    if (!pathObj.path && dependencyPath) {
      pathObj = recursionDirFindPath(dependencyPath, target);
    }

    if (!pathObj.path && !notFoundList.find((k) => k === target)) {
      notFoundList.push(target);
    }

    pbPaths.push(pathObj);
    return pathObj.path;
  };

  try {
    root
      .loadSync(protoFiles, {
        keepCase: true,
        alternateCommentMode: true,
      })
      .resolveAll();
  } catch (e) {
    console.error(e);
    if (notFoundList.length > 0) {
      error("The following proto could not be found");
      console.log(notFoundList);
      console.log();
    }
  }
  // remove absolute path
  pbPaths.forEach((obj) => {
    const target = obj.target.replace(apiDir, "");
    obj.target = target.match(/^\//) ? target : "/" + target;
  });
  return {
    root,
    pbPaths,
  };
}
