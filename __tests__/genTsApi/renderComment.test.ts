import { renderImport } from "../../src/genTsApi";

describe("renderImport test", () => {
  test("Single line rendering", () => {
    const imports = [
      {
        importClause: ["A", "B", "C"],
        moduleSpecifier: "~/moduleA",
      },
    ];
    const result = renderImport(imports);
    const expected = `import { A,B,C } from '~/moduleA'`;
    expect(result).toBe(expected);
  });

  test("Multi-line rendering", () => {
    const imports = [
      {
        importClause: ["A", "B", "C"],
        moduleSpecifier: "~/moduleA",
      },
      {
        importClause: ["A", "B", "C"],
        moduleSpecifier: "~/moduleB",
      },
    ];
    const result = renderImport(imports);
    const expected = `import { A,B,C } from '~/moduleA'\nimport { A,B,C } from '~/moduleB'`;
    expect(result).toBe(expected);
  });
});
