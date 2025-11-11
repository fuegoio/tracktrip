import { watch } from "fs/promises";
import { relative, resolve } from "path";

import { loader } from "fumadocs-core/source";
import { createMdxPlugin } from "fumadocs-mdx/bun";

import type { Plugin } from "vite";

Bun.plugin(
  createMdxPlugin({
    configPath: "docs/source.config.ts",
  }),
);

interface FumadocsMdxPluginOptions {
  baseUrl: string;
}

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
    } catch (e) {
      console.error("[fumadocs-mdx] Error reloading source:", e);
    }
  };

  return {
    name: "vite-plugin-fumadocs-mdx",
    enforce: "post",

    async buildStart() {
      // Initialize the source
      await updateSource();
    },

    async configureServer(server) {
      const docsDir = resolve(process.cwd(), "docs/content");
      watcher = watch(docsDir, { recursive: true });

      // Process changes asynchronously
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
          const mod = server.moduleGraph.getModuleById("fumadocs-mdx:pages");
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({
              type: "full-reload",
              path: "fumadocs-mdx:pages",
            });
          }
        }
      })();
    },

    resolveId(id) {
      if (id === "fumadocs-mdx:pages") {
        return id;
      }
      return null;
    },

    async load(id) {
      if (id === "fumadocs-mdx:pages") {
        return `
          const pages = ${JSON.stringify(source.getPages())};
          const pageTree = ${JSON.stringify(source.getPageTree())};
          export { pages, pageTree };
        `;
      }
      return null;
    },

    async buildEnd() {
      // Clean up the watcher
      if (watcher) {
        await watcher.return?.();
        watcher = null;
      }
    },
  };
}
