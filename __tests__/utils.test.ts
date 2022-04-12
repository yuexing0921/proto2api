import { toHump, recursionDirFindPath } from "../src/utils";

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
    expect(() => {
      recursionDirFindPath("aa-bc-dd", "/path");
    }).toThrowError(/the path does not exist/);
  });

  test("when the path exists", () => {
    const result = recursionDirFindPath(__dirname, "/genTsApi/");
    const expected = "__tests__/genTsApi/";
    expect(result).toEqual(expect.stringMatching(expected));
  });
});
