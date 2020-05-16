import { __, assertEquals, path } from "../../dev_deps.ts";
import { loadEnvFromFile, loadEnvFromObject } from "../../lib/env.ts";

const { __dirname } = __(import.meta);

Deno.test("loads env from file", async () => {
  const envObject = await loadEnvFromFile(path.resolve(__dirname, ".env.test"));

  assertEquals(envObject, { HELLO_WORLD: "123" });
});

Deno.test("loads env from object", async () => {
  assertEquals(
    loadEnvFromObject({
      a: "a",
      b: 1,
      c: true,
    }),
    {
      a: "a",
      b: "1",
      c: "true",
    }
  );
});
