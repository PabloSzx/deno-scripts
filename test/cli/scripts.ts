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
    echo1: {
      run: "echo 1111",
    },
    echo2: {
      run: "echo 2222",
    },
    exit: {
      run: "(exit 5)",
    },
  },
  {
    colors: false,
    debug: false,
    concurrentScripts: {
      parallel: {
        scripts: ["echo1", "echo2"],
        mode: "parallel",
      },
      parallelFail: {
        scripts: ["echo1", "exit"],
        mode: "parallel",
      },
      sequential: {
        scripts: ["echo2", "echo1"],
        mode: "sequential",
      },
      sequentialFail: {
        scripts: ["echo1", "exit", "echo2"],
        mode: "sequential",
      },
    },
  },
);
