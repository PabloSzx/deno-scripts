# deno_scripts

Type-safe centralized Deno project scripts 🦕

[![deno version](https://img.shields.io/badge/deno-1.0.5-success)](https://github.com/denoland/deno)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/deno_scripts/mod.ts)
[![ci](https://github.com/PabloSzx/deno_scripts/workflows/test/badge.svg)](https://github.com/PabloSzx/deno_scripts/actions)
[![license](https://img.shields.io/github/license/PabloSzx/deno_scripts)](https://github.com/PabloSzx/deno_scripts/blob/master/LICENSE)

![logo](/static/deno_scripts.png)

## Install

> You can change `ds` to any name you prefer calling it

```sh
deno install -f -n ds --allow-run --allow-read --allow-write https://deno.land/x/deno_scripts/cli.ts
```

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Features](#features)
- [Usage](#usage)
  - [File script configuration](#file-script-configuration)
  - [Run script configuration](#run-script-configuration)
  - [Global configuration](#global-configuration)
  - [Concurrent scripts](#concurrent-scripts)
- [Contributing](#contributing)
- [Credits](#credits)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

- [x] Type-safety and auto-completion
- [x] Permissions management
- [x] Environment variables support (from `.env` or from _config_)
- [x] Watching for files changes support
- [x] Automatic `deno fmt`
- [x] Concurrent script execution (`parallel` or `sequential`) support

## Usage

![CLI Screenshot](/static/cli_1.png)

First, you should init the configuration file, you can simply execute

> In the root of your project

```sh
ds init
```

![CLI Init Screenshot](/static/cli_init_help.png)

It will generate a `scripts.ts` file like this:

```ts
import { Scripts } from "https://deno.land/x/deno_scripts/mod.ts";

Scripts(
  {
    // ds test
    test: {
      run: "deno test -A",
      // Enable watch mode
      watch: true,
      // Add environment variables
      env: {
        DENO_ENV: "test",
      },
    },
    // ds dev
    dev: {
      file: "./mod.ts",
      // Enable watch mode
      watch: true,
      // Add environment variables
      env: {
        DENO_ENV: "development",
      },
    },
    // ds start
    start: {
      file: "./mod.ts",
      // Add environment variables
      env: {
        DENO_ENV: "production",
      },
    },
  },
  {
    // Shared default watch options
    watch: {
      // Only watch for files with extension ".ts"
      extensions: ["ts"],
    },
    // Default permissions added to
    // every "file script".
    permissions: {
      allowNet: true,
    },
    // Automatic `deno fmt` call
    fmt: true,
  }
);
```

As you could see, there are two different type of scripts, one is `file`, and the other is `run`.

Then you can simply use it

```sh
ds test
## or
ds dev
## or you can simply call it using deno itself
deno run -A scripts.ts start
## Every argument after the script name is going to be added as an argument to the end of the script itself
```

### File script configuration

It will run the specified file as `deno run ...`

You can specify the configuration as it follows:

```ts
interface ScriptFile {
  /**
   * File to be executed with "deno run ..."
   */
  file: string;
  /**
   * Permissions management
   */
  permissions?: {
    allowAll?: boolean;
    allowEnv?: boolean;
    allowHRTime?: boolean;
    allowNet?: boolean | string;
    allowPlugin?: boolean;
    allowRead?: boolean | string;
    allowRun?: boolean;
    allowWrite?: boolean | string;
  };
  /**
   * tsconfig location
   */
  tsconfig?: string;
  /**
   * Deno args to be added
   */
  denoArgs?: string | string[];
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
  watch?:
    | boolean
    | {
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
      };
}
```

### Run script configuration

It will run the specified command **as it is**.

You can specify the configuration as it follows:

```ts
interface ScriptRun {
  /**
   * Command to be executed
   */
  run: string;
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
  watch?:
    | boolean
    | {
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
      };
}
```

### Global configuration

You can also specify a second options object to the `Scripts` constructor.

> | **Remember** | The **local** configuration will always have a priority over **global** configuration

```ts
Scripts(
  {
    foo: {
      run: "echo dev",
    },
    bar: {
      file: "./mod.ts",
    },
  },
  {
    // Enable Debug mode
    debug: true,
    // Enable automatic fmt
    fmt: true,
    // Permissions added to every file script,
    permissions: {
      allowRead: true,
    },
    tsconfig: "./tsconfig.json",
    // Check the types for more configuration
  }
);
```

You can specify the global config as it follows

```ts
interface GlobalConfig {
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
  watch?: {
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
  };
  /**
   * Permissions management
   *
   * These permissions are added to every `file` script
   */
  permissions?: {
    allowAll?: boolean;
    allowEnv?: boolean;
    allowHRTime?: boolean;
    allowNet?: boolean | string;
    allowPlugin?: boolean;
    allowRead?: boolean | string;
    allowRun?: boolean;
    allowWrite?: boolean | string;
  };
  /**
   * tsconfig location
   */
  tsconfig?: string;
  /**
   * Deno args to be added to every file script
   */
  denoArgs?: string | string[];
  /**
   * Load environment variables from a file
   *
   * If it's `true` it will look for ".env"
   *
   * By default it's set to `true` if a `.env` exists.
   */
  envFile?: boolean | string;
  /**
   * Add environment variables to every script
   */
  env?: Record<string, string | number | boolean>;
  /**
   * Arguments to be added after every script
   */
  args?: string | string[];
  /**
   * Specify shell to use for `run` scripts.
   *
   * By default `cmd.exe` for Windows, and `sh -c` for Linux & macOS.
   */
  shell?: string;
}
```

### Concurrent scripts

To execute scripts concurrently you have to specify an extra `concurrentScripts` field in your global configuration.

```ts
Scripts(
  {
    hello: {
      run: "echo hello",
    },
    world: {
      run: "echo world",
    },
  },
  {
    concurrentScripts: {
      helloWorldParallel: {
        // Specify the scripts you previously defined
        scripts: ["hello", "world"],
        // By default it's set to `parallel`
        mode: "parallel",
      },
      helloWorldSequential: {
        // Specify the scripts you previously defined
        scripts: ["hello", "world"],
        // If `sequential`, it will wait in the
        // specified order to run the next script
        mode: "sequential",
      },
    },
  }
);
```

Then you can just call them like any other script:

> **Keep in mind that watch mode still can be used simultaneously**, but in `sequential mode` it would only make sense to be the **last script** specified for it to be enabled.

```sh
ds helloWorldParallel
ds helloWorldSequential
```

## Contributing

This project is aimed to be a improved `package.json` scripts, but adding a lot a features commonly added by third party libraries.

If you have an idea of a feature, the Issues and Pull Requests are open.

## Credits

Special thanks to:

- [Denomander](https://github.com/siokas/denomander) for some **CLI** functionality.
- [denon](https://github.com/eliassjogreen/denon) for the **watching** functionality.
- [denv](https://github.com/crowlKats/denv) for the **.env** functionality.
- [Kia](https://github.com/HarryPeach/kia) for the **_sexy_** spinners.
- [Freepik](https://www.flaticon.com/authors/freepik) for the logo.
