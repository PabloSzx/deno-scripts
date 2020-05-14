import { Scripts } from "https://denopkg.com/PabloSzx/deno-scripts";

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
  },
);
