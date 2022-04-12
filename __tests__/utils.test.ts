import {
  toHump,
  recursionDirFindPath,
  getRelativePathABDepth,
} from "../src/utils";

describe("getRelativePathABDepth tests", () => {
  test("one layer cycle", () => {
    const result = getRelativePathABDepth("/a/b/c", "/b");
    const expected = "../a/b/c";
    expect(result).toBe(expected);
  });
  test("two layer cycle", () => {
    const result = getRelativePathABDepth("/a/b/c", "/b/c");
    const expected = "../../a/b/c";
    expect(result).toBe(expected);
  });
});

describe("toHump test", () => {
  test("aabc => aabc", () => {
    const result = toHump("aabc");
    const expected = "aabc";
    expect(result).toBe(expected);
  });
  test("aa_1bc => aa1bc", () => {
    const result = toHump("aa_1bc");
    const expected = "aa1bc";
    expect(result).toBe(expected);
  });
  test("aa_bc => aaBc", () => {
    const result = toHump("aa_bc");
    const expected = "aaBc";
    expect(result).toBe(expected);
  });
  test("aa_bc_ee => aaBcEe", () => {
    const result = toHump("aa_bc_ee");
    const expected = "aaBcEe";
    expect(result).toBe(expected);
  });

  test("aa-bc => aaBc", () => {
    const result = toHump("aa-bc");
    const expected = "aaBc";
    expect(result).toBe(expected);
  });
  test("aa-bc-dd => aaBcDd", () => {
    const result = toHump("aa-bc-dd");
    const expected = "aaBcDd";
    expect(result).toBe(expected);
  });

  test("aa-bc-dd big hump => AaBcDd", () => {
    const result = toHump("aa-bc-dd", true);
    const expected = "AaBcDd";
    expect(result).toBe(expected);
  });
});

describe("recursionDirFindPath tests", () => {
  test("path does not exist", () => {
    const result = recursionDirFindPath("aa-bc-dd", "/path");
    const expected = {
      path: "",
      target: "",
    };
    expect(result).toEqual(expected);
  });

  test("when the path exists", () => {
    const result = recursionDirFindPath(process.cwd(), "/__tests__");
    const expected = {
      target: "/__tests__",
      path: expect.stringMatching(/__tests__/),
    };
    expect(result).toMatchObject(expected);
  });

  test("relative path", () => {
    const result = recursionDirFindPath(__dirname, "/__tests__/utils.test.ts");
    const expected = {
      target: "/utils.test.ts",
      path: expect.stringMatching(/__tests__/),
    };
    expect(result).toMatchObject(expected);
  });
});
