export interface Import {
  importClause: string[];
  moduleSpecifier?: string;
  resolvedPath?: string;
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
// The type of the dependent element in the message
export enum DependencyType {
  // message Info{
  //   int32 code = 1;
  //   enum Item {
  //     xxx = 1;
  //   }
  //   Item item = 2;
  // }
  INLINE = "inline",

  // message Info{
  //   int32 code = 1;
  //   google.protobuf.Method method = 2;
  // }
  EXTERNAL = "external",

  // message Item{
  //   string id = 1;
  // }
  // message Info{
  //   int32 code = 1;
  //   Item item = 2;
  // }
  CURRENT = "current",

  // message Info{
  //   int32 code = 1;
  // }
  SYSTEM = "system",
}

export interface PropertySignature {
  name: string;
  type: string;
  dependencyType: DependencyType; // default 'system'
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
  reqResolvedPath: string;
  url: string;
  redirectUrl?: string;
  res: string;
  resResolvedPath: string;
  method: "get" | "post" | "put" | "patch" | "delete";
}

export interface ApiFile {
  protoPath: string; // proto file path
  protoTargetPath: string; // proto target file path
  outputPath: string; // generated path
  apiPrefixPath: string;
  comment?: string; // comment in the header
  imports: Import[]; // referenced external dependencies
  enums: Enum[]; // all enums
  interfaces: Interface[]; // all interfaces
  apiModules: ApiModule[]; //
}
