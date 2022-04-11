import {
  ApiFile,
  ApiFunction,
  ApiModule,
  Enum,
  Import,
  Interface,
} from "../apiInterface";
import {
  enumGenEnum,
  isSchemaArray,
  isSchemaEnum,
  serviceGenApiFunction,
  toHumpName,
} from "./core";

import {
  Swagger,
  RequestInfo,
  SwaggerPathInfo,
  ParameterInfo,
  SchemaType,
  SchemaEnum,
} from "./interface";

class ParseSwagger {
  private _root: Swagger;
  imports: Import[] = [];
  enums: Enum[] = [];
  interfaces: Interface[] = [];
  apiModules: ApiModule[] = [];
  _currentInterfaceName: string;
  constructor(swaggerData: Swagger) {
    this._root = swaggerData;
  }

  parseTags(tags: Swagger["tags"]) {
    tags.forEach((tag) => {
      this.apiModules.push({
        name: tag.name,
        comment: tag.description || "",
        functions: this.parsePaths(this._root.paths, tag.name),
      });
    });
  }

  parsePaths(paths: Swagger["paths"], tagValue: string) {
    let functions: ApiModule["functions"] = [];
    Object.keys(paths).forEach((url) => {
      const fun = paths[url] as SwaggerPathInfo;
      for (const method of Object.keys(fun)) {
        const k = fun[method] as RequestInfo;
        if (!k.tags.find((t) => t === tagValue)) {
          continue;
        }
        const apiFunction = serviceGenApiFunction(url, method as any, k);
        functions.push(apiFunction);

        // visit req
        this._currentInterfaceName = apiFunction.req
        
        this.interfaces.push();
      }
    });
    return functions;
  }

  parseParameters(parameters: ParameterInfo, name: string) {
    this.interfaces.push({
      name,
      members: this.parseSchemaType(parameters.scheme),
    });
  }

  parseSchemaType(type: SchemaType, name: string) {
    if (isSchemaArray(type)) {
    }
    if (isSchemaEnum(type)) {
      return enumGenEnum(name, type as SchemaEnum);
    }
  }
}
