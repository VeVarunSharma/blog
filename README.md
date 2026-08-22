# Ve Sharma

A dark-first technical publication built with Astro, MDX, and selectively
hydrated React Flow diagrams.

The site has two content lanes:

- **Posts** are shorter, date-led technical articles.
- **White papers** are numbered long-form pieces with an abstract and table of
  contents.

Both support the same MDX components, tags, code blocks, figures, and
interactive diagrams. The production output is entirely static and deploys to
GitHub Pages at [blog.vesharma.dev](https://blog.vesharma.dev).

## Local development

Use the supported Node.js version in `.nvmrc`:

```sh
nvm use
npm install
npm run dev
```

Astro serves the site at `http://localhost:4321`.

| Command                | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start the local development server               |
| `npm test`             | Run focused unit tests                           |
| `npm run check`        | Validate Astro, TypeScript, and content schemas  |
| `npm run lint`         | Lint Astro, TypeScript, React, and config code   |
| `npm run format:check` | Check Astro, MDX, CSS, and repository formatting |
| `npm run build`        | Generate the production site in `dist/`          |
| `npm run preview`      | Serve the production build locally               |

## Add a post

Create `src/content/posts/<slug>.mdx`:

```mdx
---
title: 'A useful, specific title'
description: 'One sentence used on cards and in search metadata.'
publishedAt: 2026-08-22
tags:
  - Architecture
draft: false
featured: false
---

Write the article in Markdown.
```

Posts are available at `/posts/<slug>/`. Set `draft: true` to keep an entry
visible in development but exclude it from production.

## Add a white paper

Create `src/content/papers/<slug>.mdx` with the shared fields plus:

```yaml
paperNumber: 2
abstract: 'A self-contained summary of the argument and its scope.'
status: Published
series: 'Optional series label'
```

Papers are available at `/papers/<slug>/`. Their `h2` and `h3` headings generate
the responsive table of contents.

The complete schema is in `src/content.config.ts`.

## Add an interactive diagram

1. Define typed nodes and edges in `src/data/diagrams/<name>.ts`.
2. Import that definition from the MDX file.
3. Render it with the shared component.

```mdx
import { siteArchitecture } from '../../data/diagrams/siteArchitecture';

<FlowDiagram
  diagram={siteArchitecture}
  caption="A concise explanation of what the diagram establishes."
/>
```

The component hydrates only when it approaches the viewport. Readers can pan,
zoom, select, and drag nodes. They cannot create or reconnect edges. Each
diagram also requires a plain-language summary so its argument is not available
only through JavaScript.

## Themes

Dark mode is the first-visit default. The light theme uses a warm paper palette,
and the toggle stores the reader's explicit choice in local storage. Theme
tokens live in `src/styles/tokens.css`; React Flow inherits those same tokens.

## CI and deployment

Pull requests, pushes to `main`, and manual runs use
`.github/workflows/ci.yml`. The workflow exposes three independently requireable
status checks:

| Status check      | Commands                                    |
| ----------------- | ------------------------------------------- |
| `Unit tests`      | `npm test`                                  |
| `Validation`      | `npm run check`, then `npm run build`       |
| `Lint and format` | `npm run lint`, then `npm run format:check` |

The checks are separate jobs in one workflow. This keeps them independently
visible in branch protection while allowing the Pages artifact and deployment
to remain tied to the same commit. Successful `main` runs upload `dist/` and
deploy only after all three checks pass.

Pull requests also receive a `Dependency review` check that warns on newly
introduced dependencies with moderate-or-higher known vulnerabilities without
blocking the PR (`warn-only: true`), since this repository's Dependency Graph
must be enabled under **Settings > Advanced Security** for the check to run at
all. Dependabot opens grouped weekly minor and patch updates for npm and
GitHub Actions; major updates remain separate for deliberate review.

### One-time GitHub setup

1. In **Settings > Pages > Build and deployment**, choose **GitHub Actions** as
   the source.
2. Set the custom domain to `blog.vesharma.dev`.
3. Configure the DNS provider with this CNAME record:

```text
blog -> vevarunsharma.github.io
```

4. Enable **Enforce HTTPS** after GitHub validates the DNS record.
5. In the `main` branch ruleset, require `Unit tests`, `Validation`, and
   `Lint and format`. Requiring `Dependency review` is also recommended.

The custom domain is preserved in `public/CNAME`. Astro's `site` value is
`https://blog.vesharma.dev`, so no `/blog` project-path `base` is used.
