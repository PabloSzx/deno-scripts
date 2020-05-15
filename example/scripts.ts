import { Scripts } from "https://deno.land/x/deno_scripts/mod.ts";

Scripts(
  {
    hello: {
      file: "./dev.ts",
      permissions: {},
    },
    asd: {
      run: "echo hello world",
    },
  },
  {
    permissions: {
      allowRun: true,
    },
    preArgs: "",
  }
);
