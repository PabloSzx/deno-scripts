import { path } from "../../deps.ts";
import { __, assert, assertStrContains } from "../../dev_deps.ts";
import { fixDirnameWindows } from "../utils.ts";

let { dirname } = __(import.meta);

dirname = fixDirnameWindows(dirname);

const CLIFileLocation = path.resolve(dirname, "../../cli.ts");

Deno.test("cli run parallel success", async () => {
  const runProcess = Deno.run({
    cwd: dirname,
    cmd: ["deno", "run", "-A", CLIFileLocation, "parallel"],
    stdin: "null",
    stderr: "null",
    stdout: "piped",
  });

  assert((await runProcess.status()).code === 0);

  const enc = new TextDecoder();

  const parallelOutput = enc.decode(await runProcess.output()).trim();

  assertStrContains(parallelOutput, "1111");
  assertStrContains(parallelOutput, "2222");

  runProcess.close();
});

Deno.test("cli run parallel fail", async () => {
  const runProcess = Deno.run({
    cwd: dirname,
    cmd: ["deno", "run", "-A", CLIFileLocation, "parallelFail"],
    stdin: "null",
    stderr: "piped",
    stdout: "piped",
  });

  await runProcess.status();

  const enc = new TextDecoder();

  const parallelError = enc.decode(await runProcess.stderrOutput()).trim();

  const parallelOutput = enc.decode(await runProcess.output()).trim();

  assertStrContains(parallelOutput, "1111");
  assertStrContains(parallelError, "Script exit failed with code 5.");

  runProcess.close();
});

Deno.test("cli run sequential success", async () => {
  const runProcess = Deno.run({
    cwd: dirname,
    cmd: ["deno", "run", "-A", CLIFileLocation, "sequential"],
    stdin: "null",
    stderr: "null",
    stdout: "piped",
  });

  assert((await runProcess.status()).code === 0);

  const enc = new TextDecoder();

  const parallelOutput = enc.decode(await runProcess.output()).trim();

  assertStrContains(parallelOutput, "1111");
  assertStrContains(parallelOutput, "2222");

  runProcess.close();
});

Deno.test("cli run sequential fail", async () => {
  const runProcess = Deno.run({
    cwd: dirname,
    cmd: ["deno", "run", "-A", CLIFileLocation, "sequentialFail"],
    stdin: "null",
    stderr: "piped",
    stdout: "piped",
  });

  await runProcess.status();

  const enc = new TextDecoder();

  const parallelError = enc.decode(await runProcess.stderrOutput()).trim();

  const parallelOutput = enc.decode(await runProcess.output()).trim();

  assertStrContains(parallelOutput, "1111");
  assertStrContains(parallelError, "Script exit failed with code 5.");
  assert(!parallelOutput.includes("2222"));

  runProcess.close();
});
