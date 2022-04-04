import { renderImport } from "../../src/genTsApi";
import { trim } from "../utils";

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
    const result = trim(renderImport(imports));
    const expected = trim(`
      import { A,B,C } from '~/moduleA'
      import { A,B,C } from '~/moduleB'
    `);
    expect(result).toBe(expected);
  });
});
