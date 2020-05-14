export const defaultEmptyObject = {};
export const defaultEmptyArray: any[] = [];

const NotFileFoundError = "No such file or directory";

export function toArgsStringList(
  args: string | string[] | undefined,
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

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await Deno.readFile(filePath);
    return true;
  } catch (err) {
    if (err.message.includes(NotFileFoundError)) {
      return false;
    } else {
      throw err;
    }
  }
}
