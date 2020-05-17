import { Scripts } from "../../mod.ts";

Scripts(
  {
    echo: {
      run: "echo hello world",
    },
    log: {
      file: "./echo.ts",
    },
    watchFile: {
      file: "./testWatchFile.ts",
      watch: {
        interval: 100,
      },
    },
    watchRun: {
      run: "deno run ./testWatchFile.ts",
      watch: {
        match: ["*/testWatchFile.ts"],
        interval: 100,
      },
    },
  },
  {
    colors: false,
    debug: false,
  }
);
