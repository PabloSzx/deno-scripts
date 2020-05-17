import { path } from "../../deps.ts";
import { __, assertStrContains } from "../../dev_deps.ts";
import { delay } from "../../lib/utils.ts";
import { fixDirnameWindows } from "../utils.ts";

let { dirname } = __(import.meta);

dirname = fixDirnameWindows(dirname);

const CLIFileLocation = path.resolve(dirname, "../../cli.ts");

const FileToWatchLocation = path.resolve(dirname, "./testWatchFile.ts");

const getNewRandomString = (n: number) => {
  return `\`${JSON.stringify(
    crypto.getRandomValues(new Uint8Array(n)),
    null,
    0
  )}\``;
};

Deno.test("watch run script", async () => {
  let randomString = getNewRandomString(7);

  await Deno.writeTextFile(
    FileToWatchLocation,
    `
      console.log("log="+${randomString});
      `.trim() + "\n"
  );

  const runProcess = Deno.run({
    cwd: dirname,
    cmd: ["deno", "run", "-A", CLIFileLocation, "watchRun"],
    stdin: "null",
    stderr: "null",
    stdout: "piped",
  });

  await delay(1000);

  const enc = new TextDecoder("utf-8", {
    ignoreBOM: true,
  });

  let buff = new Uint8Array(1024);

  await runProcess.stdout!.read(buff);

  let processOutput = enc.decode(buff).trim();

  assertStrContains(processOutput, "log=" + randomString.replace(/`/g, ""));

  assertStrContains(processOutput, "Waiting for changes...");

  randomString = getNewRandomString(8);

  await Deno.writeTextFile(
    FileToWatchLocation,
    `
      console.log("log="+${randomString});
      `.trim()
  );

  await delay(1000);

  buff = new Uint8Array(1024);

  await runProcess.stdout!.read(buff);

  runProcess.stdout!.close();

  runProcess.close();

  processOutput = enc.decode(buff).trim();

  assertStrContains(processOutput, "log=" + randomString.replace(/`/g, ""));

  assertStrContains(processOutput, "Waiting for changes...");
});

Deno.test("watch file script", async () => {
  let randomString = getNewRandomString(5);

  await Deno.writeTextFile(
    FileToWatchLocation,
    `
      console.log("log="+${randomString});
      `.trim() + "\n"
  );

  const runProcess = Deno.run({
    cwd: dirname,
    cmd: ["deno", "run", "-A", CLIFileLocation, "watchFile"],
    stdin: "null",
    stderr: "null",
    stdout: "piped",
  });

  await delay(1000);

  const enc = new TextDecoder("utf-8", {
    ignoreBOM: true,
  });

  let buff = new Uint8Array(1024);

  await runProcess.stdout!.read(buff);

  let processOutput = enc.decode(buff).trim();

  assertStrContains(processOutput, "log=" + randomString.replace(/`/g, ""));

  assertStrContains(processOutput, "Waiting for changes...");

  randomString = getNewRandomString(6);

  await Deno.writeTextFile(
    FileToWatchLocation,
    `
      console.log("log="+${randomString});
      `.trim()
  );

  await delay(1000);

  buff = new Uint8Array(1024);

  await runProcess.stdout!.read(buff);

  runProcess.stdout!.close();

  runProcess.close();

  processOutput = enc.decode(buff).trim();

  assertStrContains(processOutput, "log=" + randomString.replace(/`/g, ""));

  assertStrContains(processOutput, "Waiting for changes...");
});
