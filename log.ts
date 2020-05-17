import { colors } from "./deps.ts";

colors.setColorEnabled(true);

let debugEnabled = false;

export const setDebugMode = (enabled: boolean) => {
  debugEnabled = enabled;
};

const prefix = colors.bgBlack("| deno_scripts |");

export function fail(reason: string, code: number = 1) {
  console.error(`${prefix} ${colors.red(reason)}`);

  Deno.exit(code);
}

export function log(text: string) {
  console.log(`${prefix} ${colors.green(text)}`);
}

export function warn(text: string) {
  console.warn(`${prefix} ${colors.bgYellow(text)}`);
}

let regex101Reminded = false;

//@ts-ignore
RegExp.prototype.toJSON = function () {
  if (!regex101Reminded) {
    regex101Reminded = true;
    debug(
      `You can copy the regular expressions into ${colors.black(
        colors.bgCyan("https://regex101.com/")
      )} and debug there\n`,
      "Regex101"
    );
  }

  return this.toString();
};

export function debug(data: unknown, title?: string) {
  if (debugEnabled) {
    console.log(
      `${prefix} ${title ? colors.bgMagenta(title) + " " : ""}` +
        colors.yellow(
          `${
            typeof data === "object"
              ? "\n" + JSON.stringify(data, null, 2).replace(/\\\\/g, "\\")
              : (data as string)
          }`
        )
    );
  }
}
