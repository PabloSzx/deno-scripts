# deno_scripts

Type-safe centralized Deno project scripts 🦕

## Install

> You can change `dsc` to any name you prefer calling it

```sh
deno install -f -n dsc --allow-run --allow-read --allow-write https://deno.land/x/deno_scripts/cli.ts
```

## Features

- [x] Type-safety
- [x] Permissions management
- [ ] [denon](https://github.com/eliassjogreen/denon) support (coming soon)
- [ ] Environment variables support (coming soon)

## Usage

First, you should init the configuration file, you can simply execute

> In the root of your project

```sh
dsc init
```

It will generate a `scripts.ts` file like so

```ts
import { Scripts } from "https://deno.land/x/deno_scripts/mod.ts";

Scripts({
  foo: {
    run: "echo dev",
  },
  bar: {
    file: "./mod.ts",
  },
});
```

As you could see, there are two different type of scripts, one is `file`, and the other is `run`.

Then you can simply use it

```sh
dsc foo
## or
dsc bar
## or you can simply call it using deno itself
deno run --allow-run scripts.ts foo
```

### file

It will run the specified file as `deno run ...`

You can specify the configuration as it follows:

```ts
interface ScriptFile {
  /**
   * File to be executed with "deno run ..."
   */
  file: string;
  /**
   * Arguments to be added **before** the script itself.
   */
  preArgs?: string | string[];
  /**
   * Arguments to be added **after** the script itself.
   */
  postArgs?: string | string[];
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
}
```

### run

It will run the specified command **as it is**.

You can specify the configuration as it follows:

```ts
interface ScriptRun {
  /**
   * Command to be executed
   */
  run: string | string[];
  /**
   * Arguments to be added **before** the script itself.
   */
  preArgs?: string | string[];
  /**
   * Arguments to be added **after** the script itself.
   */
  postArgs?: string | string[];
}
```

### Global Config

You can also specify a second options object to the `Scripts` constructor.

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

You can specify the config as it follows

```ts
interface GlobalConfig {
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
   * Arguments to be added **before** the script itself.
   */
  preArgs?: string | string[];
  /**
   * Arguments to be added **after** the script itself.
   */
  postArgs?: string | string[];
}
```
