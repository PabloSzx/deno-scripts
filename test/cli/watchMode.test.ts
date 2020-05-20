import { path } from "../../deps.ts";
import { __, assertStrContains } from "../../dev_deps.ts";
import { delay } from "../../lib/utils.ts";
import { fixDirnameWindows } from "../utils.ts";

// GitHub actions has a bug with piped output
// therefore, these tests simply don't work
if (Deno.env.get("GITHUB") === undefined) {
  let { dirname } = __(import.meta);

  dirname = fixDirnameWindows(dirname);

  const CLIFileLocation = path.resolve(dirname, "../../cli.ts");

  const FileToWatchLocation = path.resolve(dirname, "./testWatchFile.ts");

  const getNewRandomString = (n: number) => {
    return `\`${
      JSON.stringify(
        crypto.getRandomValues(new Uint8Array(n)),
        null,
        0,
      )
    }\``;
  };

  Deno.test("watch run script", async () => {
    try {
      let randomString = getNewRandomString(7);

      await Deno.writeTextFile(
        FileToWatchLocation,
        `console.log("log="+${randomString});\n`,
      );

      const runProcess = Deno.run({
        cwd: dirname,
        cmd: ["deno", "run", "-A", CLIFileLocation, "watchRun"],
        stdin: "null",
        stderr: "null",
        stdout: "piped",
      });

      await delay(2500);

      const enc = new TextDecoder();

      let buff = new Uint8Array(200);

      await runProcess.stdout!.read(buff);

      let processOutput = enc.decode(buff).trim();

      assertStrContains(processOutput, "log=" + randomString.replace(/`/g, ""));

      assertStrContains(processOutput, "Waiting for changes...");

      randomString = getNewRandomString(8);

      await Deno.writeTextFile(
        FileToWatchLocation,
        `console.log("log="+${randomString});\n`,
      );

      await delay(2000);

      buff = new Uint8Array(200);

      await runProcess.stdout!.read(buff);

      runProcess.stdout!.close();

      runProcess.close();

      processOutput = enc.decode(buff).trim();

      assertStrContains(
        processOutput.toString(),
        "log=" + randomString.replace(/`/g, ""),
      );

      assertStrContains(processOutput, "Waiting for changes...");
    } finally {
      await Deno.remove(FileToWatchLocation);
    }
  });

  Deno.test("watch file script", async () => {
    try {
      let randomString = getNewRandomString(5);

      await Deno.writeTextFile(
        FileToWatchLocation,
        `console.log("log="+${randomString});\n`,
      );

      const runProcess = Deno.run({
        cwd: dirname,
        cmd: ["deno", "run", "-A", CLIFileLocation, "watchFile"],
        stdin: "null",
        stderr: "null",
        stdout: "piped",
      });

      await delay(2000);

      const enc = new TextDecoder();

      let buff = new Uint8Array(200);
      await runProcess.stdout!.read(buff);

      let processOutput = enc.decode(buff).trim();

      assertStrContains(processOutput, "log=" + randomString.replace(/`/g, ""));

      assertStrContains(processOutput, "Waiting for changes...");

      randomString = getNewRandomString(6);

      await Deno.writeTextFile(
        FileToWatchLocation,
        `console.log("log="+${randomString});\n`,
      );

      await delay(2000);

      buff = new Uint8Array(200);
      await runProcess.stdout!.read(buff);

      runProcess.stdout!.close();

      runProcess.close();

      processOutput = enc.decode(buff).trim();

      assertStrContains(processOutput, "log=" + randomString.replace(/`/g, ""));

      assertStrContains(processOutput, "Waiting for changes...");
    } finally {
      await Deno.remove(FileToWatchLocation);
    }
  });
}
