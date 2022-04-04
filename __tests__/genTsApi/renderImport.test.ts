import { renderComment } from "../../src/genTsApi";

describe("renderComment test", () => {
  test("Null character test", () => {
    expect(renderComment("")).toBe("");
  });
  test("Double slash comment", () => {
    const comment = `double slash comment`;
    const result = renderComment(comment);
    const expected = "// " + comment + "\n";
    expect(result).toBe(expected);
  });

  test("Multi-line comment", () => {
    const comment = `multi-line comment \nmulti-line comment`;
    const result = renderComment(comment);
    const expected = "// multi-line comment \n// multi-line comment\n";
    expect(result).toBe(expected);
  });

  test("Do not add new line-break comments", () => {
    const comment = `double slash comment`;
    const result = renderComment(comment, false);
    const expected = "// " + comment;
    expect(result).toBe(expected);
  });
});
