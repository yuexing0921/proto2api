import {
  toHumpName,
  isSchemaBase,
  isSchemaEnum,
  isSchemaType,
  isSchemaArray,
  serviceGenApiFunction,
  enumGenEnum,
  objGenInterface,
} from "../../src/swagger/core";
import {
  ApiFunction,
  DependencyType,
  Interface,
  PropertySignature,
} from "../../src/apiInterface";
import { SchemaObject } from "../../src/swagger/interface";

describe("isSchema test", () => {
  test("isSchemaBase test", () => {
    expect(
      isSchemaBase({
        type: "integer",
      })
    ).toBe(true);
    expect(
      isSchemaBase({
        type: "boolean",
      })
    ).toBe(true);
    expect(
      isSchemaBase({
        type: "number",
      })
    ).toBe(true);
    expect(
      isSchemaBase({
        type: "string",
      })
    ).toBe(true);
    expect(
      isSchemaBase({
        type: "string",
        enum: [],
      })
    ).toBe(false);
    
    expect(
      isSchemaBase({
        type: "object",
      } as any)
    ).toBe(false);
    expect(
      isSchemaBase({
        type: "array",
      } as any)
    ).toBe(false);
  });
  test("isSchemaArray test", () => {
    expect(
      isSchemaArray({
        type: "array",
      } as any)
    ).toBe(true);
    expect(
      isSchemaArray({
        type: "integer",
      })
    ).toBe(false);
    expect(
      isSchemaArray({
        type: "string",
      })
    ).toBe(false);
    expect(
      isSchemaArray({
        type: "object",
      } as any)
    ).toBe(false);
  });
  test("isSchemaType test", () => {
    expect(
      isSchemaType({
        type: "object",
        properties: {},
      })
    ).toBe(true);
    expect(
      isSchemaType({
        type: "integer",
      })
    ).toBe(false);
    expect(
      isSchemaType({
        type: "string",
      })
    ).toBe(false);
    expect(
      isSchemaType({
        type: "array",
      } as any)
    ).toBe(false);
  });
  test("isSchemaEnum test", () => {
    expect(
      isSchemaEnum({
        type: "string",
        enum: ["ENUM"],
      })
    ).toBe(true);
    expect(
      isSchemaEnum({
        type: "integer",
      })
    ).toBe(false);
    expect(
      isSchemaEnum({
        type: "string",
      })
    ).toBe(false);
    expect(
      isSchemaEnum({
        type: "object",
      } as any)
    ).toBe(false);
    expect(
      isSchemaEnum({
        type: "array",
      } as any)
    ).toBe(false);
  });
});
describe("core toHumpName test", () => {
  test("An error is reported when path is null, undefined, or number", () => {
    expect(() => {
      toHumpName("");
    }).toThrow();
    expect(() => {
      toHumpName(undefined);
    }).toThrow();
    expect(() => {
      toHumpName(null);
    }).toThrow();
  });
  test("aabc => Aabc", () => {
    const result = toHumpName("aabc");
    const expected = "Aabc";
    expect(result).toBe(expected);
  });
  test("aa_1bc => Aa1bc", () => {
    const result = toHumpName("aa_1bc");
    const expected = "Aa1bc";
    expect(result).toBe(expected);
  });
  test("aa_bc => AaBc", () => {
    const result = toHumpName("Aa_bc");
    const expected = "AaBc";
    expect(result).toBe(expected);
  });

  test("aa-bc => AaBc", () => {
    const result = toHumpName("aa-bc");
    const expected = "AaBc";
    expect(result).toBe(expected);
  });

  test("dd/aa-bc => AaBc", () => {
    const result = toHumpName("dd/aa-bc");
    const expected = "AaBc";
    expect(result).toBe(expected);
  });
  test("bb/dd/aa-bc => AaBc", () => {
    const result = toHumpName("bb/dd/aa-bc");
    const expected = "AaBc";
    expect(result).toBe(expected);
  });
  test("bb/dd/aa-bc-ee => AaBcEe", () => {
    const result = toHumpName("bb/dd/aa-bc-ee");
    const expected = "AaBcEe";
    expect(result).toBe(expected);
  });
  test("bb/dd/aa_bc => AaBc", () => {
    const result = toHumpName("bb/dd/aa_bc");
    const expected = "AaBc";
    expect(result).toBe(expected);
  });
  test("bb/dd/aa_bc_ee => AaBcEe", () => {
    const result = toHumpName("bb/dd/aa_bc_ee");
    const expected = "AaBcEe";
    expect(result).toBe(expected);
  });
});

describe("serviceGenApiFunction tests", () => {
  test("no comment", () => {
    const result = serviceGenApiFunction("a/b/ddd-info", "get", {} as any);
    const expected: ApiFunction = {
      comment: "",
      name: "getDddInfo",
      req: "GetDddInfoReq",
      res: "GetDddInfoResp",
      method: "get",
      url: "a/b/ddd-info",
    };
    expect(result).toEqual(expected);
  });

  test("has $$ref", () => {
    const result = serviceGenApiFunction("a/b/ddd-info", "get", {
      parameters: [
        {
          name: "root",
          in: "body",
          schema: {
            $$ref: "#/definitions/adminInfoReq",
          },
        },
      ],
      responses: {
        200: {
          schema: {
            $$ref: "#/definitions/adminInfoResp",
          },
        },
      },
    } as any);
    const expected: ApiFunction = {
      comment: "",
      name: "getDddInfo",
      req: "AdminInfoReq",
      res: "AdminInfoResp",
      method: "get",
      url: "a/b/ddd-info",
    };
    expect(result).toEqual(expected);
  });

  test("Both summary and description are sometimes", () => {
    const result = serviceGenApiFunction("a/b/ddd-info", "get", {
      summary: "summary",
      description: "description",
    } as any);
    const expected: ApiFunction = {
      comment: "summary\ndescription",
      name: "getDddInfo",
      req: "GetDddInfoReq",
      res: "GetDddInfoResp",
      method: "get",
      url: "a/b/ddd-info",
    };
    expect(result).toEqual(expected);
  });

  test("only summary", () => {
    const result = serviceGenApiFunction("a/b/ddd-info", "get", {
      summary: "summary",
    } as any);
    const expected: ApiFunction = {
      comment: "summary",
      name: "getDddInfo",
      req: "GetDddInfoReq",
      res: "GetDddInfoResp",
      method: "get",
      url: "a/b/ddd-info",
    };
    expect(result).toEqual(expected);
  });
  test("only description", () => {
    const result = serviceGenApiFunction("a/b/ddd-info", "get", {
      description: "description",
    } as any);
    const expected: ApiFunction = {
      comment: "description",
      name: "getDddInfo",
      req: "GetDddInfoReq",
      res: "GetDddInfoResp",
      method: "get",
      url: "a/b/ddd-info",
    };
    expect(result).toEqual(expected);
  });
});

describe("enumGenEnum tests", () => {
  test("normal enum conversion", () => {
    const enumTep = {
      type: "string",
      description: "注释",
      enum: ["ENUM_A", "ENUM_B"],
    };
    const result = enumGenEnum("label_type", enumTep as any);
    const expected = {
      name: "LabelType",
      comment: "注释",
      members: [
        {
          name: "ENUM_A",
          initializer: "ENUM_A",
        },
        {
          name: "ENUM_B",
          initializer: "ENUM_B",
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  test("$$ref enum conversion", () => {
    const enumTep = {
      type: "string",
      description: "注释",
      enum: ["ENUM_A", "ENUM_B"],
      $$ref: "#/definitions/testRefEnum",
    };
    const result = enumGenEnum("label_type", enumTep as any);
    const expected = {
      name: "TestRefEnum",
      comment: "注释",
      members: [
        {
          name: "ENUM_A",
          initializer: "ENUM_A",
        },
        {
          name: "ENUM_B",
          initializer: "ENUM_B",
        },
      ],
    };
    expect(result).toEqual(expected);
  });

  test("About enumDesc in enum ", () => {
    const enumTep = {
      type: "string",
      description: "注释",
      enumDesc: "desc enum",
      enum: ["ENUM_A", "ENUM_B"],
      $$ref: "#/definitions/testRefEnum",
    };
    const result = enumGenEnum("label_type", enumTep as any);
    const expected = {
      name: "TestRefEnum",
      comment: "desc enum",
      members: [
        {
          name: "ENUM_A",
          initializer: "ENUM_A",
        },
        {
          name: "ENUM_B",
          initializer: "ENUM_B",
        },
      ],
    };
    expect(result).toEqual(expected);
  });
});

describe("objGenInterface tests", () => {
  test("normal test", () => {
    const obj = {
      type: "object",
      description: "test objGenInterface",
      properties: {
        ret_code: {
          type: "integer",
          format: "int32",
        },
        ret_msg: {
          type: "string",
        },
      },
      $$ref: "#/definitions/getInfoResp",
    };
    const result = objGenInterface("testResp", obj as SchemaObject);
    const expected: Interface = {
      name: "GetInfoResp",
      comment: "test objGenInterface",
      members: [
        {
          comment: "",
          name: "ret_code",
          type: "integer",
          dependencyType: DependencyType.SYSTEM,
          repeated: false,
        },
        {
          comment: "",
          name: "ret_msg",
          type: "string",
          repeated: false,
          dependencyType: DependencyType.SYSTEM,
        },
      ],
    };
    expect(result).toEqual(expected);
  });
});
