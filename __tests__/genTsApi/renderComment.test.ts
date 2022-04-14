import { renderImport } from "../../src/genTsApi";
import { trim } from "../_utils";

describe("renderImport test", () => {
  test("Single line rendering", () => {
    const imports = [
      {
        importClause: [
          {
            type: "A",
          },
          {
            type: "B",
          },
          {
            type: "C",
          },
        ],
        moduleSpecifier: "~/moduleA",
      },
    ];
    const result = renderImport(imports, {});
    const expected = `import { A,B,C } from '~/moduleA'`;
    expect(result).toBe(expected);
  });

  test("Multi-line rendering", () => {
    const imports = [
      {
        importClause: [
          {
            type: "A",
          },
          {
            type: "B",
          },
          {
            type: "C",
          },
        ],
        moduleSpecifier: "~/moduleA",
      },
      {
        importClause: [
          {
            type: "A",
          },
          {
            type: "B",
          },
          {
            type: "C",
          },
        ],
        moduleSpecifier: "~/moduleB",
      },
    ];
    const result = trim(renderImport(imports, {}));
    const expected = trim(`
      import { A,B,C } from '~/moduleA'
      import { A,B,C } from '~/moduleB'
    `);
    expect(result).toBe(expected);
  });

  test("Alias name test", () => {
    const imports = [
      {
        importClause: [
          {
            type: "A",
            dependencyTypeName: "xx.BB.A",
          },
          {
            type: "B",
          },
          {
            type: "C",
          },
        ],
        moduleSpecifier: "~/moduleA",
      },
    ];
    const result = renderImport(imports, { A: 1 });
    const expected = `import { A as XxBBA,B,C } from '~/moduleA'`;
    expect(result).toBe(expected);
  });
});
