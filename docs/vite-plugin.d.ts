declare module "fumadocs-mdx:pages" {
  interface Page {
    url: string;
    slugs: string[];
    data: any;
  }
  export const getPage: (url: string) => Page | undefined;
  export const pages: Page[];
}
