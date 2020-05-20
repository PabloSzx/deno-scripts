import { default as Denomander } from "https://denopkg.com/PabloSzx/denomander";
import * as DenomanderErrors from "https://denopkg.com/PabloSzx/denomander/custom_errors.ts";

import { colors, exists } from "./deps.ts";
import { fail, log, prefix, warn } from "./lib/log.ts";
import { defaultEmptyArray } from "./lib/utils.ts";

if (import.meta.main) {
  const scriptsTSLogName = colors.rgb8(colors.bgBlack("scripts.ts"), 231);

  const program = new Denomander({
    app_name: prefix(),
    app_description: `Configure and organize your project scripts.

Any command not specified here will run the scripts specified in your ${scriptsTSLogName} file.`,
    app_version: "1.0.0",
  });

  program
    .command("init", `Initialize a ${scriptsTSLogName} file`)
    .option("-r | --reload", "Reload dependencies cache");

  let scriptsTSExists = await exists("./scripts.ts");

  try {
    program.parse(Deno.args);
  } catch (err) {
    switch (err) {
      case DenomanderErrors.VALIDATION_COMMAND_NOT_FOUND:
      case DenomanderErrors.VALIDATION_OPTION_NOT_FOUND: {
        break;
      }
      default: {
        throw err;
      }
    }
  }

  if (program.init) {
    const runScriptsCache = async () => {
      await Deno.run({
        cmd: [
          "deno",
          "cache",
          ...(program.reload ? ["-r"] : defaultEmptyArray),
          "./scripts.ts",
        ],
      }).status();
    };
    if (scriptsTSExists) {
      if (program.reload) {
        await runScriptsCache();
        log("scripts.ts cache refreshed!");
      } else {
        log("scripts.ts file already exists.");
      }
    } else {
      Deno.writeTextFileSync(
        "./scripts.ts",
        `import { Scripts } from "https://deno.land/x/deno_scripts/mod.ts";

      Scripts(
        {
          // ds test
          test: {
            run: "deno test -A",
            // Enable watch mode
            watch: true,
            // Add environment variables
            env: {
              DENO_ENV: "test",
            },
          },
          // ds dev
          dev: {
            file: "./mod.ts",
            // Enable watch mode
            watch: true,
            // Add environment variables
            env: {
              DENO_ENV: "development",
            },
          },
          // ds start
          start: {
            file: "./mod.ts",
            // Add environment variables
            env: {
              DENO_ENV: "production",
            },
          },
        },
        {
          // Shared default watch options
          watch: {
            // Only watch for files with extension ".ts"
            extensions: ["ts"],
          },
          // Default permissions added to
          // every "file script".
          permissions: {
            allowNet: true,
          },
          // Automatic \`deno fmt\` call
          fmt: true,
        }
      );`,
      );

      await Deno.run({
        cmd: ["deno", "fmt", "-q", "./scripts.ts"],
      }).status();

      await runScriptsCache();

      log("\nscripts.ts file created.");
    }
  } else {
    if (scriptsTSExists) {
      const cmd = ["deno", "run", "-A", "./scripts.ts", ...Deno.args];

      await Deno.run({
        cmd,
      }).status();
    } else {
      fail("scripts.ts file not found!");
    }
  }
} else {
  warn("CLI should be called from shell!");
}
