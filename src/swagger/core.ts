import { toHump } from "../utils";

export const pathToName = (path: string) => {
  if (!path) {
    throw new Error(
      "path cannot be of type null, undefined, number or empty string"
    );
  }
  const arr = path.split("/");
  return toHump(arr.pop());
};
