import {
  ApiModule,
  ApiFunction,
  Enum,
  Interface,
  PropertySignature,
  DependencyType,
} from "../apiInterface";
import { toHump } from "../utils";
import {
  RequestInfo,
  SchemaEnum,
  Swagger,
  SchemaType,
  SchemaObject,
  SchemaArray,
} from "./interface";

export const toHumpName = (path: string) => {
  if (!path) {
    throw new Error(
      "path cannot be of type null, undefined, number or empty string"
    );
  }
  const arr = path.split("/");
  return toHump(arr.pop(), true);
};

export function isSchemaBase(obj: SchemaType) {
  return !isSchemaEnum(obj) && !isSchemaType(obj) && !isSchemaArray(obj);
}

export function isSchemaEnum(obj: SchemaType) {
  return obj && obj.type === "string" && !!(obj as SchemaEnum).enum;
}

export function isSchemaType(obj: SchemaType) {
  return obj && obj.type === "object";
}

export function isSchemaArray(obj) {
  return obj && obj.type === "array";
}

export function objGenInterface(interName, item: SchemaObject): Interface {
  const result: Interface = {
    name: toHumpName(item.$$ref) || interName,
    comment: item.description || "",
    members: [],
  };

  for (const key in item.properties) {
    const field = item.properties[key];
    const member: PropertySignature = {
      name: key,
      type: field.type,
      dependencyType: DependencyType.SYSTEM,
      comment: field.description || "",
      repeated: field.type === "array",
    };
    if (!isSchemaBase(field)) {
      let $$ref;
      if (isSchemaEnum(field)) {
        $$ref = (field as SchemaEnum).$$ref;
      } else if (isSchemaArray(field)) {
        $$ref = (field as any).items.$$ref;
      } else if (isSchemaType(field)) {
        $$ref = (field as SchemaEnum).$$ref;
      }
      member.type = $$ref ? toHumpName($$ref) : toHump(key, true);
      if (isSchemaArray(field) && isSchemaBase(field.items)) {
        member.dependencyType = DependencyType.SYSTEM;
      } else {
        member.dependencyType = $$ref
          ? DependencyType.EXTERNAL
          : DependencyType.INLINE;
      }
    }

    result.members.push(member);
  }
  return result;
}

export function enumGenEnum(enumName, item: SchemaEnum): Enum {
  const name = item.$$ref ? toHumpName(item.$$ref) : toHump(enumName, true);
  const result: Enum = {
    name,
    comment: item.enumDesc || item.description || "",
    members: item.enum.map((k) => ({
      name: k,
      // initializer: item.values[k],
      initializer: k,
      // comment: item.comments[k],
    })),
  };
  return result;
}

export function serviceGenApiFunction(
  url: string,
  method: ApiFunction["method"],
  info: RequestInfo
): ApiFunction {
  const name = method + toHumpName(url);
  const resInfo = (
    info.parameters ? info.parameters[0].schema : {}
  ) as SchemaObject;
  const respInfo = (
    info.responses ? info.responses[200].schema : {}
  ) as SchemaObject;
  let comment = "";
  if (info.summary) {
    comment += info.summary;
  }
  if (info.description) {
    comment += comment ? "\n" + info.description : info.description;
  }
  return {
    name,
    url,
    comment,
    method,
    req: resInfo.$$ref ? toHumpName(resInfo.$$ref) : toHumpName(name + "Req"),
    res: respInfo.$$ref
      ? toHumpName(respInfo.$$ref)
      : toHumpName(name + "Resp"),
  };
}
