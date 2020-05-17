# deno_scripts

Type-safe centralized Deno project scripts 🦕

## Install

> You can change `ds` to any name you prefer calling it

```sh
deno install -f -n ds --allow-run --allow-read --allow-write https://deno.land/x/deno_scripts/cli.ts
```

## Features

- [x] Type-safety and auto-completion
- [x] Permissions management
- [x] Environment variables support (from `.env` or from _config_)
- [x] Watching for files changes support
- [x] Concurrent script execution (`parallel` or `sequential`) support

## Usage

First, you should init the configuration file, you can simply execute

> In the root of your project

```sh
ds init
```

It will generate a `scripts.ts` file like so

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
    // every "file script.
    permissions: {
      allowNet: true,
    },
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
```

### File script configuration

It will run the specified file as `deno run ...`

You can specify the configuration as it follows:

> | **Remember** | The **local** configuration will always have a priority over **global** configuration

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
  watch?: boolean | WatchOptions;
}
```

### Run script configuration

It will run the specified command **as it is**.

You can specify the configuration as it follows:

> | **Remember** | The **local** configuration will always have a priority over **global** configuration

```ts
interface ScriptRun {
  /**
   * Command to be executed
   */
  run: string | string[];
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
    permissions: {
      allowRead: true,
    },
    tsconfig: "./tsconfig.json",
    preArgs: "",
    postArgs: "",
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
   */
  watch?: WatchOptions;
  /**
   * Permissions management
   *
   * These permissions are added to every `file` script
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
```

### Concurrent script

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
