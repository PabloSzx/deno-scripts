# deno_scripts

Type-safe centralized Deno project scripts 🦕

## Install

```sh
deno install --allow-run --allow-read --allow-write https://denopkg.com/PabloSzx/deno_scripts/cli.ts
```

## Usage

First, you should init the configuration file, you can simply execute

> In the root of your project

```sh
deno_scripts init
```

It will generate a `scripts.ts` file like so

```ts
import { Scripts } from "https://denopkg.com/PabloSzx/deno_scripts";

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
deno_scripts foo
## or
deno_scripts bar
## or
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

## Coming soon

- [ ] [denon](https://github.com/eliassjogreen/denon) support
- [ ] Adding environment variables
