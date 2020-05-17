import { Scripts } from "./mod.ts";

Scripts(
  {
    test: {
      run: "deno test -A",
    },
    watch: {
      file: "./file-to-watch.ts",
    },
  },
  {
    watch: {
      skip: ["*testWatchFile.ts"],
    },
    debug: true,
    env: {
      hello: "world",
    },
    concurrentScripts: {
      parallel: {
        scripts: ["test", "watch"],
        mode: "parallel",
      },
    },
  }
);
