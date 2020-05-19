import { colors } from "../deps.ts";

let debugEnabled = false;

export const setDebugMode = (enabled: boolean) => {
  debugEnabled = enabled;
};

export const prefix = () =>
  colors.rgb8(colors.bgRgb8("| deno_scripts |", 0), 231);

export function fail(reason: string, code: number = 1) {
  console.error(`${prefix()} ${colors.red(reason)}`);

  Deno.exit(code);
}

export function log(text: string) {
  console.log(`${prefix()} ${colors.bgBlack(colors.rgb8(text, 40))}`);
}

export function warn(text: string) {
  if (text !== "Bad resource ID") {
    console.warn(`${prefix()} ${colors.bgBlack(colors.bgYellow(text))}`);
  }
}

let regex101Reminded = false;

//@ts-ignore
RegExp.prototype.toJSON = function () {
  if (!regex101Reminded) {
    regex101Reminded = true;
    debug(
      `You can copy the regular expressions into ${
        colors.rgb8(
          colors.bgRgb8("https://regex101.com/", 18),
          231,
        )
      } and debug there.`,
      "Regex101",
    );
  }

  return this.toString().replace(/\\\\/g, "\\");
};

export function debug(data: unknown, title?: string, name?: string) {
  if (debugEnabled) {
    console.log(
      `${prefix()} ${name ? name + " " : ""}${
        title
          ? colors.rgb8(colors.bgMagenta("[ " + title + " ]"), 231) + " "
          : ""
      }` +
        colors.bgBlack(
          colors.rgb8(
            `${
              typeof data === "object"
                ? "\n" + JSON.stringify(data, null, 1).slice(2, -2)
                : (data as string)
            }`,
            202,
          ),
        ),
    );
  }
}
