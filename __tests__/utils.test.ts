import { toHump } from "../src/utils";

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
});
