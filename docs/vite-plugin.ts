import { watch } from "fs/promises";
import { mkdir, writeFile } from "fs/promises";
import { register } from "node:module";
import { relative, resolve, dirname } from "path";

import { loader } from "fumadocs-core/source";
import { createMdxPlugin } from "fumadocs-mdx/bun";

import type { Plugin } from "vite";

if (process.versions.bun) {
  Bun.plugin(
    createMdxPlugin({
      configPath: "./docs/source.config.ts",
    }),
  );
} else {
  register("fumadocs-mdx/node/loader", import.meta.url);
}

interface FumadocsMdxPluginOptions {
  baseUrl: string;
}

const OUTPUT_FILE = resolve(process.cwd(), "docs/.source/pages.ts");

export function fumadocsMdxPlugin(options: FumadocsMdxPluginOptions): Plugin {
  const { baseUrl } = options;
  let source: Awaited<ReturnType<typeof loader>>;
  let watcher: ReturnType<typeof watch> | null = null;

  const updateSource = async () => {
    for (const file of Object.keys(require.cache)) {
      if (file.includes("docs/content")) {
        delete require.cache[file];
      }
    }
    try {
      const { create, docs } = await import("./.source");
      source = loader({
        source: await create.sourceAsync(docs.doc, docs.meta),
        baseUrl,
      });
      // Write the data to a file
      await mkdir(dirname(OUTPUT_FILE), { recursive: true });
      await writeFile(
        OUTPUT_FILE,
        `
          const pages = ${JSON.stringify(source.getPages())};
          const pageTree = ${JSON.stringify(source.getPageTree())};
          export { pages, pageTree };
        `,
      );
    } catch (e) {
      console.error("[fumadocs-mdx] Error reloading source:", e);
      throw e; // Re-throw to fail the build explicitly
    }
  };

  return {
    name: "vite-plugin-fumadocs-mdx",
    async buildStart() {
      await updateSource();
    },
    async configureServer(server) {
      const docsDir = resolve(process.cwd(), "docs/content");
      watcher = watch(docsDir, { recursive: true });
      (async () => {
        for await (const event of watcher) {
          if (!event.filename) return;
          const filename =
            typeof event.filename === "string"
              ? event.filename
              : event.filename.toString("utf-8");
          console.log(
            `[fumadocs-mdx] Detected change in: ${relative(process.cwd(), filename)}`,
          );
          await updateSource();
          // Invalidate the module cache for the output file
          const mod = server.moduleGraph.getModuleById(OUTPUT_FILE);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({
              type: "full-reload",
              path: OUTPUT_FILE,
            });
          }
        }
      })();
    },
    async buildEnd() {
      if (watcher) {
        await watcher.return?.();
        watcher = null;
      }
    },
  };
}
