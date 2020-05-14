import { argifyPrePostArgs, argifyTsconfig } from "./lib/args.ts";
import { argifyPermissions } from "./lib/permissions.ts";
import { defaultEmptyObject, toArgsStringList } from "./lib/utils.ts";

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

export interface ArgsConfig {
  /**
   * Arguments to be added **before** the script itself.
   */
  preArgs?: string | string[];
  /**
   * Arguments to be added **after** the script itself.
   */
  postArgs?: string | string[];
}

export interface CommonConfig extends ArgsConfig {
  /**
   * Permissions management
   */
  permissions?: Permissions;
  /**
   * tsconfig location
   */
  tsconfig?: string;
}

export interface GlobalConfig extends CommonConfig {}

export interface ScriptFile extends CommonConfig {
  /**
   * File to be executed with "deno run ..."
   */
  file: string;
  run?: undefined;
}

export interface ScriptRun extends ArgsConfig {
  file?: undefined;
  /**
   * Command to be executed
   */
  run: string | string[];
}

/**
 * **deno-scripts** configuration constructor
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

    if (script.file) {
      const process = Deno.run({
        cmd: [
          "deno",
          "run",
          ...argifyPermissions(script.permissions, globalConfig.permissions),
          ...argifyTsconfig(script.tsconfig, globalConfig.tsconfig),
          ...argifyPrePostArgs(script.preArgs, globalConfig.preArgs),
          script.file,
          ...argifyPrePostArgs(script.postArgs, globalConfig.postArgs),
          ...restArg,
        ],
        stdout: "inherit",
        stderr: "inherit",
        stdin: "inherit",
      });

      await process.status();

      return process;
    } else if (script.run) {
      const process = Deno.run({
        cmd: [
          ...argifyPrePostArgs(script.preArgs, globalConfig.preArgs),
          ...toArgsStringList(script.run),
          ...argifyPrePostArgs(script.postArgs, globalConfig.postArgs),
          ...restArg,
        ],
      });

      await process.status();

      return process;
    } else {
      console.error("Script not found!");
      return null;
    }
  }
}
