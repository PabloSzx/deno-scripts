import { argifyPrePostArgs, argifyTsconfig } from "./lib/args.ts";
import { argifyPermissions } from "./lib/permissions.ts";
import { defaultEmptyObject, toArgsStringList } from "./lib/utils.ts";
import { loadEnvFromFile, loadEnvFromObject } from "./lib/env.ts";
import { existsSync } from "./deps.ts";

export interface Permissions {
  allowAll?: boolean;
  allowEnv?: boolean;
  allowHRTime?: boolean;
  allowNet?: boolean | string;
  allowPlugin?: boolean;
  allowRead?: boolean | string;
  allowRun?: boolean;
  allowWrite?: boolean | string;
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

export interface GlobalConfig extends CommonDenoConfig {
  /**
   * If `debug` is enabled, it will print the command
   * that is going to be executed.
   */
  debug?: boolean;
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
  run: string | string[];
}

function defaultCommonArgs<
  LocalConfig extends CommonArgs,
  GlobalConfig extends CommonArgs
>(_local: LocalConfig, global: GlobalConfig) {
  // If envFile is not specified, it will check if a `.env` exists
  // And if it does, it will turn it `true`
  if (global.envFile === undefined) {
    if (existsSync(".env")) {
      global.envFile = true;
    }
  }
}

/**
 * **deno_scripts** configuration constructor
 */
export async function Scripts(
  config: Record<string, ScriptFile | ScriptRun>,
  /**
   * Global configuration added to every script
   */
  globalConfig: GlobalConfig = defaultEmptyObject
): Promise<Deno.Process | null> {
  {
    const [scriptArg, ...restArg] = Deno.args;

    if (!scriptArg) {
      console.log("Specify a script to be executed!");
      return null;
    }

    const script = config[scriptArg];

    if (script == null) {
      console.error(`script "${scriptArg}" not found!`);
      return null;
    }

    defaultCommonArgs(script, globalConfig);

    const envFile = script.envFile ?? globalConfig.envFile;

    let env: Record<string, string> | undefined;

    if (envFile) {
      env = await loadEnvFromFile(
        typeof envFile === "string" ? envFile : ".env"
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

    if (script.file) {
      const cmd = [
        "deno",
        "run",
        ...argifyPermissions(script.permissions, globalConfig.permissions),
        ...argifyTsconfig(script.tsconfig, globalConfig.tsconfig),
        ...argifyPrePostArgs(script.denoArgs, globalConfig.denoArgs),
        script.file,
        ...argifyPrePostArgs(script.args, globalConfig.args),
        ...restArg,
      ];
      if (globalConfig.debug) {
        console.log({
          cmd: cmd.join(" "),
          env,
        });
      }
      const process = Deno.run({
        cmd,
        stdout: "inherit",
        stderr: "inherit",
        stdin: "inherit",
        env,
      });

      await process.status();

      return process;
    } else if (script.run) {
      const cmd = [
        ...toArgsStringList(script.run),
        ...argifyPrePostArgs(script.args, globalConfig.args),
        ...restArg,
      ];
      if (globalConfig.debug) {
        console.log({
          cmd: cmd.join(" "),
          env,
        });
      }
      const process = Deno.run({
        cmd,
        env,
      });

      await process.status();

      return process;
    } else {
      console.error("Script not found!");
      return null;
    }
  }
}
