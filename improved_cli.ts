import Denomander from "https://deno.land/x/denomander/mod.ts";
import Ask from "https://deno.land/x/ask/mod.ts";

const program = new Denomander({
  app_name: "My MY App",
  app_description: "My MY Description",
  app_version: "1.0.1",
});

program.option("asd", "zxc");

program
  .command("hello")
  .description("hello world")
  .action((asd: string) => {
    console.log({
      asd,
    });
  });

program.parse(Deno.args);

const ask = new Ask();

const answers = await ask.input({
  name: "mmmm",
});

console.log({
  answers,
});
