export interface Import {
  importClause: string[];
  moduleSpecifier: string;
}

export interface EnumMember {
  name: string;
  comment?: string;
  initializer?: string | number;
}

export interface Enum {
  name: string;
  comment?: string;
  members: EnumMember[];
}

export interface PropertySignature {
  name: string;
  type: string;
  comment?: string;

  // map<keyType, type>
  map?: boolean;
  keyType?: string;

  // arr[]
  repeated?: boolean;

  optional?: boolean;
  defaultValue?: boolean;
  jsonName?: string;

  // If there is an external reference file,
  // the referenced file address will be written
  resolvedPath?: string;
  
}

export interface InterfaceModule {
  comment?: string;
  name: string;
  enums: Enum[];
  interfaces: Interface[];
}

export interface Interface {
  name: string;
  comment?: string;
  members: PropertySignature[];
  module?: InterfaceModule;
}

export interface ApiModule {
  comment?: string;
  name: string;
  functions: ApiFunction[];
}
export interface ApiFunction {
  name: string;
  comment?: string;
  req?: string;
  url: string;
  res: string;
  method: "get" | "post" | "put" | "patch" | "delete";
}

export interface ApiFile {
  path: string; // generated path
  comment?: string; // comment in the header
  imports: Import[]; // referenced external dependencies
  enums: Enum[]; // all enums
  interfaces: Interface[]; // all interfaces
  apiModules: ApiModule[]; //
}
