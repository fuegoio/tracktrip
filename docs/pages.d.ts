import type * as PageTree from "fumadocs-core/page-tree";

declare module "fumadocs-mdx:pages" {
  interface Page {
    url: string;
  }
  export const pages: Page[];
  export const pageTree: PageTree.Root;
}
