import { colors } from "./deps.ts";

colors.setColorEnabled(true);

export function fail(reason: string, code: number = 1) {
  console.log(colors.red(`| deno_scripts | ${reason}`));

  Deno.exit(code);
}

export function log(text: string) {
  console.log(colors.green(`| deno_scripts | ${text}`));
}

export function debug(data: unknown) {
  console.log(
    colors.yellow(
      `| deno_scripts | ${
        typeof data === "object" ? JSON.stringify(data, null, 2) : data
      }`
    )
  );
}
