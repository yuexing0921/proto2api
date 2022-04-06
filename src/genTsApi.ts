import {
  ApiFile,
  Import,
  Enum,
  EnumMember,
  Interface,
  PropertySignature,
  InterfaceModule,
  ApiModule,
  ApiFunction,
  DependencyType,
} from "./apiInterface";

import { format, getRelativePathABDepth } from "./utils";

export function renderComment(
  comment: string,
  isNewline: boolean = true
): string {
  const str = comment
    ? comment
        .split("\n")
        .map((k) => `// ${k}`)
        .join("\n")
    : "";
  if (str) return isNewline ? str + "\n" : str;
  else return str;
}

/**
 * list  = [{
 *  importClause: ['A', 'B', 'C'],
 *  moduleSpecifier: "./moduleA"
 * }]
 * =>
 * import { A , B, C } from "./moduleA"
 * @param list
 * @returns
 */
export function renderImport(list: Import[]) {
  return list
    .map(
      (k) =>
        `import { ${k.importClause.join(",")} } from '${k.moduleSpecifier}'`
    )
    .join("\n");
}

/**
 * list  = [{
 *  name: Status,
 *  members: [{
 *      name: 'START',
 *      initializer: 'start'
*      },{
*       name: 'END',
        initializer: 'end'
*        }]
 * }]
 * => 
 * export enum Status{
 *    START = 'start',
 *    END  = 'end'
 * }
 * @param list
 * @returns
 */
export function renderEnum(list: Enum[]) {
  const renderMembers = (member: EnumMember) => {
    if (member.initializer && isNaN(member.initializer as number)) {
      return `${renderComment(member.comment)}${member.name} = '${
        member.initializer
      }'`;
    } else {
      return `${renderComment(member.comment)}${member.name}`;
    }
  };

  return list
    .map(
      (k) => `${renderComment(k.comment)}export enum ${k.name} {
        ${k.members.map((m) => renderMembers(m)).join(",\n")}
    }`
    )
    .join("\n");
}
export function renderInterfaceModule(list: InterfaceModule[]) {
  return list
    .map(
      (k) => `${renderComment(k.comment)}export namespace ${k.name}{
        ${renderEnum(k.enums)}

        ${renderInterface(k.interfaces)}
      }`
    )
    .join("\n");
}

function getType(k: PropertySignature) {
  if (k.map) {
    return `Map<${k.keyType},${k.type}>`;
  }
  switch (k.type) {
    case "bool":
      return "boolean";
    case "int32":
    case "fixed32":
    case "uint32":
    case "float":
    case "double":
      return "number";
    case "int64":
    case "uint64":
    case "fixed64":
    case "bytes":
      return "string";
    default:
      return k.type;
  }
}

export const renderPropertySignature = (ps: PropertySignature[]) => {
  return ps
    .map((k) => {
      const name = k.jsonName ? k.jsonName : k.name;
      const type = getType(k);
      let optional = k.optional;
      if (k?.comment?.match(/optional/)) {
        optional = true;
      }
      return `${renderComment(
        k.defaultValue ? k.comment + "\n @default " : k.comment
      )}${name}${optional ? "?" : ""} : ${k.repeated ? type + "[]" : type};`;
    })
    .join("\n");
};

export function renderInterface(list: Interface[]) {
  return list
    .map((k) => {
      let str = "";
      if (k.module) {
        str = renderInterfaceModule([k.module]);
      }
      str += `${renderComment(k.comment)}export interface ${k.name}{
          ${renderPropertySignature(k.members)}
      }`;
      return str;
    })
    .join("\n\n");
}

const configStr = "config?";
/**
 * list  = [{
 *  name: 'getStatus',
 *  apiName: 'webapi',
 *  req: 'GetStatusRequest',
 *  res: 'GetResponse',
 *  url: '/api/xxx',
 *  method: 'get',
 * }]
 *
 * =>
 * export function getStatus(req: GetStatusRequest){
 *      return webapi.get<GetResponse>('/api/xxx', req)
 * }
 * @param list
 * @returns
 */
export function renderFunction(list: ApiFunction[], apiName: string) {
  const renderReturn = (k: ApiFunction) => {
    if (k.req) {
      return ` return ${apiName}.${k.method}<${k.res}>('${k.url}', req, config)`;
    } else {
      return ` return ${apiName}.${k.method}<${k.res}>('${k.url}', {}, config)`;
    }
  };

  return list
    .map((k) => {
      const reqStr = k.req ? `req: Partial<${k.req}>, ${configStr}` : configStr;
      return `${renderComment(k.comment)}export function ${k.name}(${reqStr}){
            ${renderReturn(k)}
        }`;
    })
    .join("\n\n");
}

export function renderApiModule(list: ApiModule[], apiName: string) {
  // return list
  //   .map(
  //     (k) => `${renderComment(k.comment)}export namespace ${k.name}{
  //     ${renderFunction(k.functions, apiName)}
  //   }`
  //   )
  //   .join("\n\n");

  return list
    .map(
      (k) =>
        `
        ${renderComment(
          "--------------------service Bot start---------------------------- \n" +
            k.comment
        )}
        ${renderFunction(k.functions, apiName)}`
    )
    .join("\n\n");
}

export function genApiFileCode(apiInfo: ApiFile, apiName: string) {
  return `// This is code generated automatically by the proto2api, please do not modify
  ${renderComment(apiInfo.comment)}
  ${renderImport(apiInfo.imports)}
  ${renderEnum(apiInfo.enums)}
  ${renderInterface(apiInfo.interfaces)}
  ${renderApiModule(apiInfo.apiModules, apiName)}
  `;
}

export function pbDataGenApiData(
  apiFileMap: { [fileName: string]: ApiFile },
  apiDir: string,
  output: string,
  apiName: string,
  apiPath: string,
  eslintDisable: boolean = true
): {
  [apiFilePath: string]: [code: string];
} {
  const result = {};

  for (const fileName in apiFileMap) {
    const apiFile = apiFileMap[fileName];

    apiFile.imports.forEach((k) => {
      if (k.resolvedPath) {
        const pathA = k.resolvedPath.replace(".proto", "");
        const pathB = fileName.slice(0, fileName.lastIndexOf("/"));
        k.moduleSpecifier = getRelativePathABDepth(pathA, pathB);
      }
    });

    apiFile.interfaces.forEach((inter) => {
      inter.members.forEach((mem) => {
        if (mem.dependencyType === DependencyType.INLINE) {
          mem.type = inter.name + "." + mem.type;
        }
      });
    });

    apiFile.path = fileName.replace(apiDir, output).replace(".proto", ".ts");

    if (apiFile.apiModules.length > 0) {
      // If this is a proto with api calls, need to import the configured webapi
      apiFile.imports.unshift({
        importClause: [apiName],
        moduleSpecifier: apiPath,
      });
    }

    const code = format(genApiFileCode(apiFile, apiName));
    // const code = genApiFileCode(apiFile, apiName);
    result[apiFile.path] = eslintDisable
      ? "/* eslint-disable */ \n" + code
      : code;
  }
  return result;
}
