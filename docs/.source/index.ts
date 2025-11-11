/// <reference types="vite/client" />
import { fromConfig } from 'fumadocs-mdx/runtime/vite';
import type * as Config from '../source.config';

export const create = fromConfig<typeof Config>();

export const docs = {
  doc: create.doc("docs", "docs/content", {"index.mdx": () => import("file:///Users/alexis/Projects/voyage/docs/content/index.mdx?collection=docs"), "test.mdx": () => import("file:///Users/alexis/Projects/voyage/docs/content/test.mdx?collection=docs"), }),
  meta: create.meta("docs", "docs/content", {})
};