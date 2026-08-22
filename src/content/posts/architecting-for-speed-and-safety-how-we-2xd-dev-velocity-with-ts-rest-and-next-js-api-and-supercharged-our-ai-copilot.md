---
title: "Architecting for Speed & Safety: How We 2x'd Dev Velocity with ts-rest and Next.js API (and supercharged our AI copilot)"
description: 'The tl;dr for the Busy Dev   Our initial backend was technically robust but slow to adapt to...'
publishedAt: 2025-11-17
tags:
  - 'github'
  - 'tsrest'
  - 'webdev'
  - 'nextjs'
draft: false
featured: false
image:
  src: '/images/posts/architecting-for-speed-and-safety-how-we-2xd-dev-velocity-with-ts-rest-and-next-js-api-and-supercharged-our-ai-copilot/cover.png'
  alt: "Cover image for Architecting for Speed & Safety: How We 2x'd Dev Velocity with ts-rest and Next.js API (and supercharged our AI copilot)"
sourceUrl: 'https://dev.to/vevarunsharma/architecting-for-speed-safety-how-we-2xd-dev-velocity-with-ts-rest-and-nextjs-api-and-56nb'
---

## **The tl;dr for the Busy Dev**

Our initial backend was technically robust but slow to adapt to frequent business pivots, putting our V1 platform at risk. We needed a stack that prioritized both speed and safety.

- **The Choice:** We picked **[ts-rest](https://ts-rest.com/) with Next.js** over the tighter coupling of (tRPC)[https://trpc.io/] and the isolation of a traditional REST API.
- **Why it Won:** It was the perfect "Goldilocks" solution for our team.
  - ✅ **End-to-end type safety** like tRPC, but with the flexibility of REST.
  - 💻 **Simplified DevEx:** The entire stack runs locally with a single command.
  - 🤖 **AI-Copilot Optimized:** Co-locating the frontend, backend, and a shared `DataContract.ts` file provided perfect context for GitHub Copilot, boosting its accuracy with minimal setup.
- **The Results:**
  - 🚀 **2x faster** feature development.
  - 🐛 **~30 fewer** frontend-to-backend bugs per week.
  - ✅ **We hit our revised product launch deadline.**

![ts-rest-stack-v2](/images/posts/architecting-for-speed-and-safety-how-we-2xd-dev-velocity-with-ts-rest-and-next-js-api-and-supercharged-our-ai-copilot/image-01.png)

---

## The Challenge: Navigating a Sea of Shifting Requirements

I was managing a team working on a platform refactor, and we were stuck. A month and a half behind schedule, our progress was crippled by the complexity of our backend. We were building an MVP for a token launch, and our top priority was speed to market, not architectural perfection. The current stack was failing us.

### Our Previous Architecture: More Complexity than we needed

Our original backend was fantastic from technical standards but a practical bottleneck after we had a major pivot of our business model (and anticipated more pivots). It was a custom-built, event-bus system using a Command Query Responsibility Segregation (CQRS) pattern with Domain-Driven Design. Housed in our monorepo as a separate service, it was deployed independently on GCP Cloud Run.

This architecture was designed for maximum quality and correctness. However, this came at a steep price. A seemingly small change would trigger a cascade of required updates across 7-10 different layers of code. This rigid structure meant our motto became: **Maximum quality, maximum standards, minimum speed.** For an MVP with a CEO who frequently pivoted on product requirements, this was untenable.

![previous-architecture](/images/posts/architecting-for-speed-and-safety-how-we-2xd-dev-velocity-with-ts-rest-and-next-js-api-and-supercharged-our-ai-copilot/image-02.png)

## The Spike: Finding the Right Tool for the Job

It was clear we needed a change. I initiated a technical spike to explore solutions that would dramatically increase our development velocity. I documented my findings in an Architectural Decision Records (ADR) document to carefully weigh the trade-offs of each option.
Here's a look at what we considered:

### Option 1: tRPC - Maximum Type Safety, Maximum Coupling

tRPC offers incredible end-to-end type safety by sharing types directly between the client and server.

![option-1-trpc](/images/posts/architecting-for-speed-and-safety-how-we-2xd-dev-velocity-with-ts-rest-and-next-js-api-and-supercharged-our-ai-copilot/image-03.png)

**Pros:**

- **End-to-end type safety:** Reduces the chances of runtime errors.
- **Simplified development:** No need for separate API type definitions.

**Cons:**

- **Tight Coupling:** This was the biggest drawback. We wanted the option to scale out our backend independently in the future.

```
// backend/router.ts
import { initTRPC } from '@trpc/server';
const t = initTRPC.create();

export const appRouter = t.router({
  getUser: t.procedure.input(z.string()).query(({ input }) => {
    return { id: input, name: 'John Doe' };
  }),
});

export type AppRouter = typeof appRouter;

// frontend/client.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../backend/router';

export const trpc = createTRPCReact<AppRouter>();

// frontend/MyComponent.tsx
function MyComponent() {
  const userQuery = trpc.getUser.useQuery('1');
  return <div>{userQuery.data?.name}</div>;
}
```

### Option 2: A Traditional REST API - Simple but Lacking

We also considered a conventional REST API with an Express server. This would be decoupled but wouldn't solve our type safety issues and would add significant development friction between frontend and backend and add bloated boilerplate.

![option-2-rest-api-express](/images/posts/architecting-for-speed-and-safety-how-we-2xd-dev-velocity-with-ts-rest-and-next-js-api-and-supercharged-our-ai-copilot/image-04.png)

**Pros:**

- **Decoupled:** Clear separation between frontend and backend services.

**Cons:**

- **No inherent type safety:** Requires manual type definition, leading to bugs.
- **Development friction:** Requires managing two separate local development processes.
- **Scaling Complexity:** As the application grows, the amount of manual type definitions and API call boilerplate increases, making the codebase more brittle and harder to maintain.

Here's a quick look at a simple representation:

Backend (Express):

```typescript
// services/my-api/src/index.ts
import express from 'express';
import { PrismaClient } from 'database'; // From monorepo package

const app = express();
const prisma = new PrismaClient();
const port = 3001;

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return res.status(404).send('User not found');
  }
  res.json(user);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

Frontend (React/Next.js):

Notice the manual type definition and fetch logic. If the backend user shape changes, this code will break at runtime without any warning during development. This was happening very frequently for the team at the time.

```typescript

// components/UserProfile.tsx
import { useState, useEffect } from 'react';

// Manually defined type - must be kept in sync with the backend!
interface User {
  id: string;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`http://localhost:3001/users/${userId}`);
      const data: User = await response.json();
      setUser(data);
      setIsLoading(false);
    };

    fetchUser();
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;
  return <div>Welcome, {user?.name}</div>;
}

```

### Option 3: ts-rest - The Goldilocks Solution

Then I discovered ts-rest. It offered the best of both worlds: end-to-end type safety with the flexibility of REST. We implemented it directly within our Next.js app's `/api` folder, which deploys as scalable serverless functions.

The key was its "contract-first" approach. A single `DataContract.ts` file defines the entire API surface, generating typed clients for the frontend and typed routers for the backend.

![option-3-ts-rest](/images/posts/architecting-for-speed-and-safety-how-we-2xd-dev-velocity-with-ts-rest-and-next-js-api-and-supercharged-our-ai-copilot/image-05.png)

**Pros:**

- **End-to-end type safety:** The contract ensures consistency and catches bugs at compile time.
- **RESTful by design:** Familiar, scalable, and built on web standards.
- **Semi-Decoupled:** Self-contained logic that could be easily migrated to a separate server later if needed.
- **Superb developer experience:** A single `pnpm run dev` command for easy local end-to-end testing.
- **AI-Copilot Friendly:** The co-located backend, frontend, and shared contract provide rich context for AI assistants, leading to more accurate code generation and bug detection.

**Cons:**

- **Serverless Limitations:** The serverless nature of Next.js API routes is not ideal for long-running jobs. For those, a separate, dedicated microservice would still be required.
- **Some Architectural Coupling:** While significantly less coupled than tRPC, the backend logic still lives inside the frontend application's codebase.
- **Small Learning Curve & Setup:** It introduces another "mini-framework" layer to the stack that the team needs to learn and configure.
- **Smaller Community:** Its community is smaller compared to mainstream REST implementations or even the more popular tRPC, which can mean fewer resources and community-driven solutions.

Here’s a glimpse of what the ts-rest contract and implementation look like:

```typescript
// contract.ts
import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

export const contract = c.router({
  getPost: {
    method: 'GET',
    path: `/posts/:id`,
    responses: {
      200: z.object({
        id: z.string(),
        title: z.string(),
        body: z.string(),
      }),
    },
    summary: 'Get a post by id',
  },
});

// pages/api/[...ts-rest].ts (Next.js server)
import { createNextRoute, createNextRouter } from '@ts-rest/next';
import { contract } from './contract';

const postsRouter = createNextRoute(contract, {
  getPost: async (args) => {
    // Implementation here
    return {
      status: 200,
      body: { id: args.params.id, title: 'Hello', body: 'World' },
    };
  },
});

export default createNextRouter(contract, postsRouter);


// lib/api-client.ts (React client)
import { initQueryClient } from '@ts-rest/react-query';
import { contract } from './contract';

export const client = initQueryClient(contract, {
  baseUrl: 'http://localhost:3000/api',
  baseHeaders: {},
});

// components/MyComponent.tsx
function MyComponent() {
  const { data, isLoading } = client.getPost.useQuery(['post', '1'], { params: { id: '1' } });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>{data.body.title}</div>;
}

```

## The Result: Shipping Faster and with Fewer Bugs

The decision to go with ts-rest was a game-changer. The team began moving twice as fast on features that required backend integration. We saw a dramatic drop in bug tickets related to frontend-to-backend communication. Most importantly, we were able to hit our revised product launch deadline.

The frontend developers, in particular, had loved this new setup. The ability to run and test the full application locally has been a huge boost to their productivity and confidence.

## The Unforeseen Advantage: Supercharging Our AI Copilot

A major pro we hadn't fully anticipated was how this architecture would empower our use of AI coding assistants like GitHub Copilot. We quickly realized a fundamental truth: **Context is king in AI-driven software development.**

By having the frontend, backend, and the shared `DataContract.ts` file all living in a contextually adjacent space, we gave Copilot a complete, end-to-end picture of every feature. This had significant effects:

- **More Accurate Generation:** Copilot could reference the data contract and backend logic to generate client-side code that correctly fetched and handled data from the start.
- **Smarter Debugging:** The AI was far better at catching errors, flagging incompatible data types between the frontend and backend because it could see both sides of the conversation.
- **Holistic Refactoring:** Updating a type in the contract prompted Copilot to provide intelligent suggestions for updating the implementation on _both_ the client and the server.

While you can configure Copilot to work effectively across separate repos, it often requires extra setup. The beauty of our approach was that this rich, end-to-end context was provided **naturally and with zero additional configuration**, turning our AI assistant into a true force multiplier for every developer on the team.

![Dev-in-F1](/images/posts/architecting-for-speed-and-safety-how-we-2xd-dev-velocity-with-ts-rest-and-next-js-api-and-supercharged-our-ai-copilot/cover.png)

## **Final Takeaways: Why This Stack Was a Game-Changer**

For our specific needs—building an V1 of a platform quickly with rapidly changing requirements—the pros of ts-rest far outweighed the cons. The decision fundamentally improved our team's velocity and the quality of our product.

Here’s a summary of our biggest wins:

- **Massive Velocity Boost:** We started moving **2x faster** on backend-dependent features. This wasn't just a small improvement; it was the key factor that allowed us to hit our critical MVP deadline.

- **Drastic Bug Reduction:** The type-safe contract enforced by ts-rest virtually eliminated a whole class of common and frustrating frontend-to-backend integration errors.

- **A+ Developer Experience:** The ability to run and test the full application locally with a single `pnpm run dev` command was a huge morale and productivity booster for the entire team.

- **AI as a Force Multiplier:** This was the surprise win. Our architecture provided the perfect context for GitHub Copilot _by default_. It made the AI smarter at generating code, catching bugs, and refactoring across the stack, making every developer more efficient without any extra configuration.

While not a silver bullet for every project, combining ts-rest with Next.js gave us the ultimate trifecta for our platform V1: speed, safety, and a supercharged AI development workflow.
