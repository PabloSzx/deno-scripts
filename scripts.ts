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
      file: "./example/file-to-watch.ts",
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
      run: "sleep 5s && echo 1 && sleep 3s && echo 3",
    },
    exit: {
      run: "sleep 2s && (exit 1)",
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
        scripts: ["echo3", "exit", "echo3", "echo3"],
        mode: "sequential",
      },
      sequentialFail: {
        scripts: ["echo1", "exit", "echo2"],
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
