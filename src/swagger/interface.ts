export interface SwaggerTag {
  name: string;
  description: string;
}

export type SchemaType = SchemaBase | SchemaEnum | SchemaObject | SchemaArray;

export interface SchemaBase {
  type: "string" | "integer" | "boolean" | "number";
  description?: string;
}

export interface SchemaEnum {
  type: "string";
  enum: string[];
  enumDesc?: string;
  default?: string;
  title?: string;
  description?: string;
  $$ref?: string;
}

export interface SchemaObject {
  type: "object";
  properties: SchemaType;
  description?: string;
  required?: string[];
  $$ref?: string;
}

export interface SchemaArray {
  type: "array";
  items: SchemaType;
  description?: string;
}

export interface ParameterInfo {
  name: string;
  in: string;
  schema: SchemaType;
}

export interface RequestInfo {
  tags: string[];
  summary: string;
  description: string;
  consumes: string[];
  parameters: ParameterInfo[];
  responses: {
    "200": {
      description?: string;
      schema: SchemaType;
    };
  };
}

export interface SwaggerPathInfo {
  post?: RequestInfo;
  get?: RequestInfo;
  put?: RequestInfo;
  delete?: RequestInfo;
  patch?: RequestInfo;
}

export interface Swagger {
  swagger: string;
  info: {
    title: string;
    version: string;
  };
  basePath: string;
  tags: SwaggerTag[];
  schemes: string[];
  paths: { [path: string]: SwaggerPathInfo };
}
