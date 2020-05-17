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
      run: "cat ./testWatchFile.ts",
      watch: {
        match: ["*/testWatchFile.ts"],
        interval: 100,
      },
    },
  },
  {
    debug: true,
  }
);
