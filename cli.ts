import { exists, existsSync } from "./deps.ts";
import { fail, log } from "./log.ts";

if (import.meta.main) {
  const [cmd = ""] = Deno.args;

  switch (cmd.toLowerCase()) {
    case "init": {
      const scriptsTSExists = existsSync("./scripts.ts");
      if (scriptsTSExists) {
        log("scripts.ts file already exists.");
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
              // every "file script.
              permissions: {
                allowNet: true,
              },
            }
          );`,
        );

        await Deno.run({
          cmd: ["deno", "fmt", "-q", "./scripts.ts"],
        }).status();

        await Deno.run({
          cmd: ["deno", "cache", "./scripts.ts"],
        }).status();

        log("\nscripts.ts file created.");
      }

      break;
    }
    default: {
      await execScriptsFile();
    }
  }
}

async function execScriptsFile() {
  const scriptsTSExists = await exists("./scripts.ts");

  if (scriptsTSExists) {
    const cmd = ["deno", "run", "-A", "./scripts.ts", ...Deno.args];

    await Deno.run({
      cmd,
    }).status();
  } else {
    fail("scripts.ts file not found!");
  }
}
