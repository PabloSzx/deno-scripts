import { toArgsStringList } from "./utils.ts";

export function argifyPrePostArgs(
  localArgs: string | string[] | undefined,
  globalArgs: string | string[] | undefined,
): string[] {
  const args: string[] = [];

  if (localArgs) {
    args.push(...toArgsStringList(localArgs));
  }

  if (globalArgs) {
    args.push(...toArgsStringList(globalArgs));
  }

  return args;
}

export function argifyTsconfig(
  localTsconfig: string | undefined,
  globalTsconfig: string | undefined,
): string[] {
  if (localTsconfig) {
    return [`-c=${localTsconfig}`];
  }
  if (globalTsconfig) {
    return [`-c=${globalTsconfig}`];
  }
  return [];
}
