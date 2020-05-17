import { Scripts } from "./mod.ts";

Scripts(
  {
    testGitHub: {
      run: "deno test -A",
      env: {
        GITHUB: 1,
      },
    },
    test: {
      run: "deno test -A",
      watch: true,
    },
    watch: {
      file: "./file-to-watch.ts",
      watch: {
        match: [/.*file-to-watch\.ts$/],
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
    fmt: true,
    colors: true,
    watch: {
      extensions: [".ts"],
      skip: ["*testWatchFile.ts"],
    },
  },
);
