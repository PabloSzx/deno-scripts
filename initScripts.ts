import { Scripts } from "https://denopkg.com/PabloSzx/deno_scripts";

Scripts({
  foo: {
    run: "echo dev",
  },
  bar: {
    file: "./mod.ts",
  },
});
