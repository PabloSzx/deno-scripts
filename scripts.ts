import { Scripts } from "./mod.ts";

Scripts({
  test: {
    run: "deno test -A",
  },
  watch: {
    file: "./file-to-watch.ts",
    watch: true,
  },
});
