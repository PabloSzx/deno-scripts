import Kia from "https://denopkg.com/PabloSzx/kia";
import { Spinners } from "https://denopkg.com/PabloSzx/kia/spinners.ts";

import { colors, exists, existsSync } from "./deps.ts";
import {
  argifyArgs,
  argifyImportMap,
  argifyTsconfig,
  argifyUnstable,
} from "./lib/args.ts";
import { loadEnvFromFile, loadEnvFromObject } from "./lib/env.ts";
import { debug, fail, log, prefix, setDebugMode, warn } from "./lib/log.ts";
import { argifyPermissions } from "./lib/permissions.ts";
import {
  defaultEmptyArray,
  defaultEmptyObject,
  getShellArgs,
  toArgsStringList,
} from "./lib/utils.ts";
import { fileEventToPast, Watcher } from "./lib/watcher.ts";

export interface Permissions {
  allowAll?: boolean;
  /**
   * If any environment variable is set,
   * it will automatically be **enabled**.
   */
  allowEnv?: boolean;
  allowHRTime?: boolean;
  allowNet?: boolean | string;
  allowPlugin?: boolean;
  allowRead?: boolean | string;
  allowRun?: boolean;
  allowWrite?: boolean | string;
}

export interface WatchOptions {
  /**
   * Paths to add while watching
   */
  paths?: string[];
  /**
   * Watch for the specified Glob
   */
  match?: (string | RegExp)[];
  /**
   * Skip the specified paths or files
   */
  skip?: (string | RegExp)[];
  /**
   * Specify extensions to be watched
   */
  extensions?: string[];
  /**
   * Interval used while watching files
   */
  interval?: number;
  /**
   * Recursively watch all files of the paths
   */
  recursive?: boolean;
}

export interface CommonArgs {
  /**
   * Load environment variables from a file
   *
   * If it's `true` it will look for ".env"
   *
   * By default it's set to `true` if a `.env` exists.
   */
  envFile?: boolean | string;
  /**
   * Add environment variables
   */
  env?: Record<string, string | number | boolean>;
  /**
   * Arguments to be added after the script
   */
  args?: string | string[];
  /**
   * Enable watch and/or specify options
   */
  watch?: boolean | WatchOptions;
}

export interface CommonDenoConfig extends CommonArgs {
  /**
   * Permissions management
   */
  permissions?: Permissions;
  /**
   * tsconfig location
   */
  tsconfig?: string;
  /**
   * Deno args to be added
   */
  denoArgs?: string | string[];
}

export interface GlobalConfig<ConfigKeys> extends CommonDenoConfig {
  /**
   * If `debug` is enabled, it will print some helpful
   * information showing what is going on.
   */
  debug?: boolean;
  /**
   * Import map path
   */
  importMap?: string;
  /**
   * Enable unstable features
   */
  unstable?: boolean;
  /**
   * Concurrent scripts
   */
  concurrentScripts?: Record<string, ScriptConcurrent<ConfigKeys>>;
  /**
   * Enable colors in CLI
   *
   * `true` by default.
   */
  colors?: boolean;
  /**
   * Execute `deno fmt` automatically
   */
  fmt?: boolean | string | string[];
  /**
   * Default watch options
   *
   * This configuration **DOES NOT** enables watch mode,
   * it just adds these options to every watch enabled script.
   */
  watch?: WatchOptions;
  /**
   * Permissions management
   *
   * These permissions are added to every `file` script
   */
  permissions?: Permissions;
  /**
   * Specify shell to use for `run` scripts.
   *
   * By default `cmd.exe` for **Windows**, and `sh -c` for **Linux** & **macOS**.
   */
  shell?: string;
}

export interface ScriptFile extends CommonDenoConfig {
  /**
   * File to be executed with "deno run ..."
   */
  file: string;
  run?: undefined;
}

export interface ScriptRun extends CommonArgs {
  file?: undefined;
  /**
   * Command to be executed
   */
  run: string;
}

export type ScriptConcurrent<T> = {
  /**
   * Previously defined scripts to be executed
   */
  scripts: T[];
  /**
   * Concurrent mode.
   *
   * By default it's `parallel`
   */
  mode?: "sequential" | "parallel";
};

function defaultGlobalConfig(global: GlobalConfig<unknown>) {
  // If envFile is not specified, it will check if a `.env` exists
  // And if it does, it will turn it `true`
  if (global.envFile === undefined) {
    if (existsSync(".env")) {
      global.envFile = true;
    }
  }

  // Colors + Spinner functionality is enabled by default
  global.colors = Boolean(global.colors ?? true);
}

async function autoFmt(fmtConfig?: boolean | string | string[]) {
  if (fmtConfig || fmtConfig === "") {
    const cmd = [
      "deno",
      "fmt",
      ...(typeof fmtConfig !== "boolean"
        ? toArgsStringList(fmtConfig)
        : defaultEmptyArray),
    ];
    debug(cmd.join(" "), 'Automatic "deno fmt"');
    await Deno.run({
      cmd,
    }).status();

    return true;
  }
  return false;
}

/**
 * **deno_scripts** configuration constructor
 */
export async function Scripts<
  TConfig extends Record<string, ScriptFile | ScriptRun>,
  TConfigKeys extends keyof TConfig,
>(
  /**
   * Localized scripts configuration
   */
  localConfig: TConfig,
  /**
   * Global configuration added to every script
   */
  globalConfig: GlobalConfig<TConfigKeys> = defaultEmptyObject,
): Promise<void> {
  defaultGlobalConfig(globalConfig);

  const [scriptArg, ...restArg] = Deno.args;

  colors.setColorEnabled(Boolean(globalConfig.colors));

  if (!scriptArg) {
    fail("Specify a script to be executed!");
  }

  if (globalConfig.debug) {
    setDebugMode(globalConfig.debug);
  }

  const scriptKeys = Object.keys(localConfig);
  const concurrentKeys = Object.keys(
    globalConfig.concurrentScripts || defaultEmptyObject,
  );
  for (const concurrentScriptKey of concurrentKeys) {
    if (scriptKeys.includes(concurrentScriptKey)) {
      fail(
        `You can't repeat concurrent script names with normal script names, and ${concurrentScriptKey} exists in both`,
      );
    }
  }

  const concurrentScript = globalConfig.concurrentScripts?.[scriptArg];
  let parallelScript = false;

  if (concurrentScript != null) {
    concurrentScript.mode = concurrentScript.mode || "parallel";

    const scripts = concurrentScript.scripts.map((scriptName) => {
      const script = localConfig[scriptName];
      if (script == null) {
        fail(`script "${scriptArg}" not found!`);
      }
      return {
        script,
        scriptName,
      };
    });

    if (scripts.length === 0) {
      fail(`Specify at least 1 script for ${scriptArg}`);
    }

    log(
      `Executing scripts "${
        concurrentScript.scripts.join(", ")
      }" in ${concurrentScript.mode} mode.`,
    );

    await autoFmt(globalConfig.fmt);

    if (concurrentScript.mode === "parallel") {
      parallelScript = true;
      const scriptResult = await Promise.allSettled(
        scripts.map(async ({ script, scriptName }) => {
          return await (
            await execScript(script, scriptName as string)
          )?.status();
        }),
      );

      if (
        scriptResult.every((result, index) => {
          if (
            result.status === "fulfilled" &&
            result.value &&
            result.value.success
          ) {
            return true;
          }
          fail(
            `Script ${scripts[index].scriptName} failed${
              result.status === "fulfilled" && result.value
                ? ` with code ${result.value.code}`
                : ""
            }.`,
          );
          return false;
        })
      ) {
        Deno.exit(0);
      } else {
        Deno.exit(1);
      }
    } else if (concurrentScript.mode === "sequential") {
      for (const { script, scriptName } of scripts) {
        const status = await (
          await execScript(script, scriptName as string)
        )?.status();

        if (!status?.success) {
          fail(
            `Script ${scriptName} failed${
              status?.code != null ? ` with code ${status.code}` : ""
            }.`,
          );
        }
      }

      Deno.exit(0);
    } else {
      Deno.exit(1);
    }
  } else {
    const scriptConfig = localConfig[scriptArg] as
      | ScriptFile
      | ScriptRun
      | undefined;

    if (scriptConfig == null) {
      fail(`script "${scriptArg}" not found!`);
      return;
    }

    await autoFmt(globalConfig.fmt);

    const process = await execScript(scriptConfig, scriptArg);

    Deno.exit((await process?.status())?.code ?? 1);
  }

  async function execScript(
    script: ScriptFile | ScriptRun,
    scriptName: string,
  ) {
    const scriptNameColor = colors.black(colors.bgRgb8(`[${scriptName}]`, 231));

    let spinner: Kia | undefined;

    const waitingForChangesLog = async () => {
      const text = `${scriptNameColor} Waiting for changes`;
      if (globalConfig.colors && parallelScript === false) {
        spinner = new Kia({
          prefixText: `${prefix()} ${text} `,
          spinner: Spinners.dots,
        });
        await spinner.start();
      } else {
        log(text + "...");
      }
    };

    const envFile = script.envFile ?? globalConfig.envFile;

    let env: Record<string, string> | undefined;

    if (envFile) {
      env = await loadEnvFromFile(
        typeof envFile === "string" ? envFile : ".env",
      );
    }

    if (globalConfig.env) {
      env = {
        ...(env || defaultEmptyObject),
        ...loadEnvFromObject(globalConfig.env),
      };
    }

    if (script.env) {
      env = {
        ...(env || defaultEmptyObject),
        ...loadEnvFromObject(script.env),
      };
    }

    const globalPermissions: Permissions = globalConfig.permissions || {};

    if (env) {
      globalPermissions.allowEnv = true;
    }

    const watchModeEnabled = Boolean(script.watch);
    if (watchModeEnabled) {
      log(`Watch mode enabled for ${scriptNameColor}.`);
    }

    const watchOptions: WatchOptions = {
      ...(typeof globalConfig.watch === "object"
        ? globalConfig.watch
        : defaultEmptyObject),
      ...(typeof script.watch === "object" ? script.watch : defaultEmptyObject),
    };

    if (watchOptions.skip == null) {
      watchOptions.skip = ["*/.git/*"];
    } else {
      watchOptions.skip.push("*/.git/*");
    }

    if (script.file) {
      if (!(await exists(script.file))) {
        fail(`File ${script.file} not found!`);
      }

      const execCommand = () => {
        const cmd = [
          "deno",
          "run",
          ...argifyPermissions(script.permissions, globalPermissions),
          ...argifyTsconfig(script.tsconfig, globalConfig.tsconfig),
          ...argifyArgs(script.denoArgs, globalConfig.denoArgs),
          ...argifyImportMap(globalConfig.importMap),
          ...argifyUnstable(globalConfig.unstable),
          script.file,
          ...argifyArgs(script.args, globalConfig.args),
          ...restArg,
        ];
        if (globalConfig.debug) {
          debug(
            {
              cmd: cmd.join(" "),
              env,
            },
            "Command executed",
            scriptNameColor,
          );
        }
        const process = Deno.run({
          cmd,
          stdout: "inherit",
          stderr: "inherit",
          stdin: "inherit",
          env,
        });

        return process;
      };
      if (watchModeEnabled) {
        const watcher = new Watcher(
          [script.file, ...(watchOptions.paths || defaultEmptyArray)],
          {
            interval: watchOptions.interval,
            recursive: watchOptions.recursive,
            exts: watchOptions.extensions,
            match: watchOptions.match,
            skip: watchOptions.skip,
          },
          scriptNameColor,
        );

        let process = execCommand();

        process
          .status()
          .then(() => {
            waitingForChangesLog();
          })
          .catch((err) => {
            warn(err.message);
          });

        for await (const changes of watcher) {
          await spinner?.stop();

          await autoFmt(globalConfig.fmt);

          log(
            `Detected ${changes.length} change${
              changes.length > 1 ? "s" : ""
            }. Rerunning ${scriptNameColor}...`,
          );

          for (const change of changes) {
            debug(
              `File "${change.path}" was ${fileEventToPast(change.event)}`,
              undefined,
              scriptNameColor,
            );
          }

          process.close();

          process = execCommand();

          process
            .status()
            .then(() => {
              waitingForChangesLog();
            })
            .catch((err) => {
              warn(err.message);
            });
        }
      } else {
        const process = execCommand();

        return process;
      }
    } else if (script.run) {
      const cmd = [
        ...getShellArgs(globalConfig.shell),
        `${script.run} ${
          argifyArgs(script.args, globalConfig.args).join(
            " ",
          )
        } ${restArg.join(" ")}`.trim(),
      ];
      if (globalConfig.debug) {
        debug(
          {
            cmd: cmd.join(" "),
            env,
          },
          "Command to be executed",
          scriptNameColor,
        );
      }
      const execCommand = () => {
        const process = Deno.run({
          cmd,
          env,
        });

        return process;
      };

      if (watchModeEnabled) {
        if (watchOptions.paths?.length ?? 0 === 0) {
          watchOptions.paths = ["./"];
        }
        const watcher = new Watcher(
          watchOptions.paths || defaultEmptyArray,
          {
            interval: watchOptions.interval,
            recursive: watchOptions.recursive,
            exts: watchOptions.extensions,
            match: watchOptions.match,
            skip: watchOptions.skip,
          },
          scriptNameColor,
        );

        let process = execCommand();
        process
          .status()
          .then(() => {
            waitingForChangesLog();
          })
          .catch((err) => {
            warn(err.message);
          });

        for await (const changes of watcher) {
          await spinner?.stop();

          await autoFmt(globalConfig.fmt);

          log(
            `Detected ${changes.length} change${
              changes.length > 1 ? "s" : ""
            }. Rerunning ${scriptNameColor}...`,
          );

          for (const change of changes) {
            debug(
              `File "${change.path}" was ${fileEventToPast(change.event)}`,
              undefined,
              scriptNameColor,
            );
          }

          process.close();

          process = execCommand();

          process
            .status()
            .then(() => {
              waitingForChangesLog();
            })
            .catch((err) => {
              warn(err.message);
            });
        }
      } else {
        const process = execCommand();

        return process;
      }
    } else {
      fail("Script not found!");
    }
  }
}
