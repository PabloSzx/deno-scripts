import { Scripts } from "https://deno.land/x/deno_scripts/mod.ts";

Scripts(
  {
    hello: {
      file: "./dev.ts",
      permissions: {},
    },
    test: {
      run: "deno test -A",
    },
  },
  {
    envFile: false,
    permissions: {
      allowRead: true,
      allowRun: true,
    },
    debug: true,
  },
);
