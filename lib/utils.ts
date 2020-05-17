export const defaultEmptyObject = Object.freeze({}) as {};
export const defaultEmptyArray: any[] = Object.freeze([]) as [];

export function toArgsStringList(
  args: string | string[] | undefined
): string[] {
  if (args == null) return defaultEmptyArray;

  if (typeof args === "string") {
    return args.split(" ");
  }

  if (Array.isArray(args)) {
    return args;
  }

  return defaultEmptyArray;
}

export const isWindows = Deno.build.os === "windows";

export const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
