import { Scripts } from "./mod.ts";

Scripts(
  {
    test: {
      run: "deno test -A",
    },
    testWatch: {
      run: "deno test -A",
      watch: {
        skip: ["*testWatchFile.ts"],
      },
    },
    watch: {
      file: "./file-to-watch.ts",
      watch: {
        paths: ["./"],
        skip: ["*testWatchFile.ts"],
      },
    },
    echo1: {
      run: "echo 1",
    },
    echo2: {
      run: "echo 2",
    },
    echo3: {
      run: "echo 3",
    },
  },
  {
    debug: true,
    env: {
      hello: "world",
    },
    concurrentScripts: {
      parallel: {
        scripts: ["echo1", "echo2", "echo3"],
        mode: "parallel",
      },
      sequential: {
        scripts: ["echo3", "echo1", "echo2"],
        mode: "sequential",
      },
    },
    colors: true,
  }
);
