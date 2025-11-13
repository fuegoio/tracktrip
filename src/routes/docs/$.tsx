import { useMemo } from "react";

import { docs } from "@docs/.source";
import { pageTree, pages } from "@docs/.source/pages";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createClientLoader } from "fumadocs-mdx/runtime/vite";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { ArrowRight } from "lucide-react";

import type * as PageTree from "fumadocs-core/page-tree";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/links";

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const page = pages.find((p) => {
      if (params._splat === undefined) return p.url === "/docs";
      else if (params._splat === "") return p.url === "/docs";
      else return p.url === `/docs/${params._splat ?? ""}`;
    });

    if (!page) throw notFound();

    const data = {
      tree: pageTree,
      path: page.path,
      title: page.data.title,
    };
    await clientLoader.preload(page.path);
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.title} | Documentation | Tracktrip`
          : "Documentation | Tracktrip",
      },
    ],
  }),
});

const clientLoader = createClientLoader(docs.doc, {
  id: "docs",
  component({ toc, frontmatter, default: MDX }) {
    return (
      <DocsPage toc={toc}>
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <MDX
            components={{
              ...defaultMdxComponents,
            }}
          />
        </DocsBody>
      </DocsPage>
    );
  },
});

function baseOptions(): BaseLayoutProps {
  return {
    themeSwitch: {
      enabled: false,
    },
    nav: {
      title: (
        <div className="flex items-center font-semibold gap-2 md:px-2">
          <div className="size-4 rounded-full dark:bg-white bg-primary" />
          Tracktrip
        </div>
      ),
    },
    searchToggle: {
      enabled: false,
    },
    githubUrl: "https://github.com/fueogio/voyage",
    links: [
      {
        on: "nav",
        type: "main",
        icon: <ArrowRight />,
        url: "/travels",
        text: "My travels",
      },
    ],
  };
}

function Page() {
  const data = Route.useLoaderData();
  const Content = clientLoader.getComponent(data.path);
  const tree = useMemo(
    () => transformPageTree(data.tree as PageTree.Folder),
    [data.tree],
  );

  return (
    <DocsLayout {...baseOptions()} tree={tree}>
      <Content />
    </DocsLayout>
  );
}

function transformPageTree(root: PageTree.Root): PageTree.Root {
  function mapNode<T extends PageTree.Node>(item: T): T {
    if (typeof item.icon === "string") {
      item = {
        ...item,
        icon: (
          <span
            dangerouslySetInnerHTML={{
              __html: item.icon,
            }}
          />
        ),
      };
    }

    if (item.type === "folder") {
      return {
        ...item,
        index: item.index ? mapNode(item.index) : undefined,
        children: item.children.map(mapNode),
      };
    }

    return item;
  }

  return {
    ...root,
    children: root.children.map(mapNode),
    fallback: root.fallback ? transformPageTree(root.fallback) : undefined,
  };
}
