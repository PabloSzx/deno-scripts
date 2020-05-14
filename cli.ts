import { fileExists } from "./lib/utils.ts";

const [cmd = ""] = Deno.args;

switch (cmd.toLowerCase()) {
  case "init": {
    const scriptsTSExists = await fileExists("./scripts.ts");
    if (scriptsTSExists) {
      console.log("scripts.ts file already exists.");
    } else {
      Deno.writeTextFileSync(
        "./scripts.ts",
        `import { Scripts } from "https://denopkg.com/PabloSzx/deno-scripts";
        
        Scripts({
          foo: {
            run: "echo dev",
          },
          bar: {
            file: "./mod.ts",
          },
        });`,
      );
    }
    break;
  }
  default: {
    await readScriptsFile();
  }
}

async function readScriptsFile() {
  const scriptsTSExists = await fileExists("./scripts.ts");

  if (scriptsTSExists) {
    await Deno.run({
      cmd: ["deno", "run", "-A", "./scripts.ts", ...Deno.args],
    }).status();
  } else {
    console.error("scripts.ts file not found!");
  }
}
