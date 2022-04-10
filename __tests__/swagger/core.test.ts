import { trim } from "../_utils";
import { pathToName } from "../../src/swagger/core";

describe("core pathToName test", () => {
  test("An error is reported when path is null, undefined, or number", () => {
    expect(() => {
      pathToName("");
    }).toThrow();
    expect(() => {
      pathToName(undefined);
    }).toThrow();
    expect(() => {
      pathToName(null);
    }).toThrow();
  });
  test("aabc => aabc", () => {
    const result = pathToName("aabc");
    const expected = "aabc";
    expect(result).toBe(expected);
  });
  test("aa_1bc => aa1bc", () => {
    const result = pathToName("aa_1bc");
    const expected = "aa1bc";
    expect(result).toBe(expected);
  });
  test("aa_bc => aaBc", () => {
    const result = pathToName("aa_bc");
    const expected = "aaBc";
    expect(result).toBe(expected);
  });

  test("aa-bc => aaBc", () => {
    const result = pathToName("aa-bc");
    const expected = "aaBc";
    expect(result).toBe(expected);
  });

  test("dd/aa-bc => aaBc", () => {
    const result = pathToName("dd/aa-bc");
    const expected = "aaBc";
    expect(result).toBe(expected);
  });
  test("bb/dd/aa-bc => aaBc", () => {
    const result = pathToName("bb/dd/aa-bc");
    const expected = "aaBc";
    expect(result).toBe(expected);
  });
  test("bb/dd/aa-bc-ee => aaBcEe", () => {
    const result = pathToName("bb/dd/aa-bc-ee");
    const expected = "aaBcEe";
    expect(result).toBe(expected);
  });
  test("bb/dd/aa_bc => aaBc", () => {
    const result = pathToName("bb/dd/aa_bc");
    const expected = "aaBc";
    expect(result).toBe(expected);
  });
  test("bb/dd/aa_bc_ee => aaBcEe", () => {
    const result = pathToName("bb/dd/aa_bc_ee");
    const expected = "aaBcEe";
    expect(result).toBe(expected);
  });
});
