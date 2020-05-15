import { Scripts } from "https://deno.land/x/deno_scripts/mod.ts";

Scripts({
  foo: {
    run: "echo dev",
  },
  bar: {
    file: "./mod.ts",
  },
});
