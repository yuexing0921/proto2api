import chalk from "chalk";
import * as fse from "fs-extra";
import { existsSync } from "fs-extra";
import { join } from "path";
import { format as prettify } from "prettier";

export const error = (msg) => {
  console.log(chalk.red(msg));
};

export const warning = (msg) => {
  console.log(chalk.yellow(msg));
};

export const log = (msg) => {
  console.log(chalk.blue(msg));
};

export const success = (msg) => {
  console.log(chalk.green(msg));
};

export const writeFile = (writePath: string, data: string) => {
  return new Promise((resolve, reject) => {
    fse.writeFile(writePath, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

export const isPrototype = (original: any, target: any) => {
  return Object.getPrototypeOf(original) === target.prototype;
};

/**
 * 获取 pathB相对于pathA需要走多少步，才能找到对方
 * @param pathA
 * @param pathB
 * @param depth
 * @returns
 */
export function getRelativePathABDepth(pathA, pathB, depth = 0) {
  if (pathA.startsWith(pathB)) {
    const path = pathA.replace(pathB, "").slice(1);
    if (depth === 0) {
      return "./" + path;
    } else {
      return "../".repeat(depth) + path;
    }
  } else {
    return getRelativePathABDepth(
      pathA,
      pathB.slice(0, pathB.lastIndexOf("/")),
      depth + 1
    );
  }
}

export function format(code: string): string {
  const option = {
    printWidth: 80,
    singleQuote: true,
    semi: true,
    tabWidth: 2,
    insertPragma: true,
    bracketSpacing: true,
    useTabs: false,
    parser: "typescript",
  };

  return prettify(code, option);
}

export const recursionDirFindPath = (
  rootDir: string,
  target: string
): {
  path: string;
  target: string;
} => {
  if (!target) {
    return {
      path: "",
      target,
    };
  }
  const path = join(rootDir, target);
  if (existsSync(path)) {
    return {
      path,
      target: target.match(/^\//) ? target : "/" + target,
    };
  }
  const arr = target.split("/");
  arr.shift();
  return recursionDirFindPath(rootDir, arr.join("/"));
};

export const toHump = function (str: string, isBigHump = false): string {
  const a = str.split(/-|_/);
  let result = a[0];
  for (let i = 1; i < a.length; i++) {
    result = result + a[i].slice(0, 1).toUpperCase() + a[i].slice(1);
  }
  if (isBigHump) {
    return result.replace(/^\S/, (sub) => sub.toUpperCase());
  }
  return result;
};
