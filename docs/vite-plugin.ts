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

  return {
    name: "vite-plugin-fumadocs-mdx",
    enforce: "post",

    async buildStart() {
      // Wait for the mdx plugin to generate the config
      try {
        const { create, docs } = await import("./.source");

        source = loader({
          source: await create.sourceAsync(docs.doc, docs.meta),
          baseUrl,
        });
      } catch (e) {
        console.error(e);
      }
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
  };
}
