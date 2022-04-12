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
} from "./apiInterface";

import { format } from "./utils";

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

function getProtoType(type: string): string {
  switch (type) {
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
      return type;
  }
}

function getType(k: PropertySignature) {
  if (k.map) {
    return `Map<${getProtoType(k.keyType)},${k.type}>`;
  }
  return getProtoType(k.type);
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
export function renderFunction(
  list: ApiFunction[],
  apiName: string,
  apiPrefixPath: string
): string {
  const renderReturn = (k: ApiFunction) => {
    const url = apiPrefixPath ? apiPrefixPath + k.url : k.url;
    if (k.req) {
      return ` return ${apiName}.${k.method}<${k.res}>('${url}', req, config)`;
    } else {
      return ` return ${apiName}.${k.method}<${k.res}>('${url}', {}, config)`;
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

export function renderApiModule(
  list: ApiModule[],
  apiName: string,
  apiPrefixPath: string
): string {
  // return list
  //   .map(
  //     (k) => `${renderComment(k.comment)}export namespace ${k.name}{
  //     ${renderFunction(k.functions, apiName)}
  //   }`
  //   )
  //   .join("\n\n");

  return list
    .map(
      (k) => `
        ${renderComment(k.comment + "\n" + k.name)}
        ${renderFunction(k.functions, apiName, apiPrefixPath)}
      `
    )
    .join("\n\n");
}

export function genApiFileCode(
  apiInfo: ApiFile,
  apiName: string,
  apiPrefixPath: string
): string {
  return `// This is code generated automatically by the proto2api, please do not modify
  ${renderComment(apiInfo.comment)}
  ${renderImport(apiInfo.imports)}
  ${renderEnum(apiInfo.enums)}
  ${renderInterface(apiInfo.interfaces)}
  ${renderApiModule(apiInfo.apiModules, apiName, apiPrefixPath)}
  `;
}

export type GenCodeOptions = {
  apiFileMap: { [fileName: string]: ApiFile };
  apiName: string;
  apiPath: string;
  apiPrefixPath: string;
  eslintDisable?: boolean;
};
export function genCode(options: GenCodeOptions): {
  [apiFilePath: string]: [code: string];
} {
  const result = {};
  const {
    apiFileMap,
    apiName,
    apiPath,
    apiPrefixPath,
    eslintDisable = true,
  } = options;

  for (const fileName in apiFileMap) {
    const apiFile = apiFileMap[fileName];
    if (apiFile.apiModules.length > 0) {
      // If this is a proto with api calls, need to import the configured webapi
      apiFile.imports.unshift({
        importClause: [apiName],
        moduleSpecifier: apiPath,
      });
    }

    const code = format(genApiFileCode(apiFile, apiName, apiPrefixPath));
    // const code = genApiFileCode(apiFile, apiName);
    result[apiFile.path] = eslintDisable
      ? "/* eslint-disable */ \n" + code
      : code;
  }
  return result;
}
