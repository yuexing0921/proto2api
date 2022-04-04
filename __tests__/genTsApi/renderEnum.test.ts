import { trim } from "../utils";
import { renderEnum } from "../../src/genTsApi";

describe("renderEnum test", () => {
  test("Normal number enum", () => {
    const list = [
      {
        name: "Status",
        members: [
          {
            name: "START",
          },
          {
            name: "END",
          },
        ],
      },
    ];
    const result = trim(renderEnum(list));
    const expected = trim(`
      export enum Status {
        START,
        END
      }
    `);
    expect(result).toBe(expected);
  });

  test("String enumeration", () => {
    const list = [
      {
        name: "Status",
        members: [
          {
            name: "START",
            initializer: "start",
          },
          {
            name: "END",
            initializer: "end",
          },
        ],
      },
    ];
    const result = trim(renderEnum(list));
    const expected = trim(`
      export enum Status {
        START = 'start',
        END = 'end'
      }
    `);
    expect(result).toBe(expected);
  });

  test("An enumeration with comments", () => {
    const list = [
      {
        name: "Status",
        members: [
          {
            name: "START",
            initializer: "start",
            comment: "status start",
          },
          {
            name: "END",
            initializer: "end",
            comment: "status end",
          },
        ],
      },
    ];
    const result = trim(renderEnum(list));
    const expected = trim(`
      export enum Status {
        // status start
        START = 'start',
        // status end
        END = 'end'
      }
    `);
    expect(result).toBe(expected);
  });
});
