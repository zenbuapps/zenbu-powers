# Next.js 15 -- App Router Technical Reference

Target version: `next ^15.5.15` with React 19.
Official docs: https://nextjs.org/docs (App Router mode).

> v15.x uses the **previous caching model** (without `cacheComponents` flag) by default.
> The `"use cache"` directive and `cacheComponents: true` are v16+ features documented in
> [./cache-components.md](./cache-components.md) for forward-looking awareness.

## Table of Contents & Reference Map

| Topic | Where |
|-------|-------|
| File conventions, route groups, dynamic segments | This file, Section 1 |
| Server vs Client Components, "use client" rules | This file, Section 2 |
| Data fetching, streaming, Suspense | This file, Section 3 |
| Server Actions ("use server") | This file, Section 4 |
| Caching, revalidation, ISR | This file, Section 5 |
| Static vs dynamic rendering rules | This file, Section 6 |
| v15 breaking changes & pitfalls | This file, Section 7 |
| Route Handlers, Middleware, next.config | [./routing-and-config.md](./routing-and-config.md) |
| Image, Metadata API, OG images | [./image-and-metadata.md](./image-and-metadata.md) |
| Parallel routes, intercepting routes | [./advanced-routing.md](./advanced-routing.md) |
| API function signatures (complete) | [./api-functions.md](./api-functions.md) |
| Cache Components ("use cache", v16+) | [./cache-components.md](./cache-components.md) |

---

## 1. App Router File Conventions

### 1.1 Core Special Files

| File | Purpose | Client Component? |
|------|---------|-------------------|
| `layout.tsx` | Shared UI wrapping children; state preserved across navigations | No |
| `page.tsx` | Unique UI for a route; makes route publicly accessible | No |
| `loading.tsx` | Instant loading UI (auto-wrapped in `<Suspense>`) | No |
| `error.tsx` | Error boundary for route segment | **Yes** |
| `not-found.tsx` | 404 UI triggered by `notFound()` | No |
| `template.tsx` | Like layout but re-mounts on navigation | No |
| `default.tsx` | Fallback for parallel route slots on hard navigation | No |
| `route.ts` | API endpoint; cannot coexist with `page.tsx` at same level | N/A |
| `global-error.tsx` | Root error boundary; must include `<html>` and `<body>` | **Yes** |

### 1.2 Root Layout (Required)

```tsx
// app/layout.tsx -- MUST contain <html> and <body>
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-TW"><body>{children}</body></html>;
}
```

### 1.3 Route Groups & Dynamic Segments

Route groups `(folder)` organize without affecting URL. Each can have its own layout.

| Pattern | Example | Matches |
|---------|---------|---------|
| `[slug]` | `app/blog/[slug]/page.tsx` | `/blog/hello` |
| `[...slug]` | `app/shop/[...slug]/page.tsx` | `/shop/a`, `/shop/a/b/c` |
| `[[...slug]]` | `app/docs/[[...slug]]/page.tsx` | `/docs`, `/docs/a/b` |

### 1.4 Page & Layout Props (v15 -- ASYNC)

**Breaking change**: `params` and `searchParams` are `Promise` types.

```tsx
// page.tsx
export default async function Page({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { query } = await searchParams;
}
```

Synchronous Client Components use `React.use()`:
```tsx
'use client';
import { use } from 'react';
export default function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
}
```

---

## 2. Server Components vs Client Components

### 2.1 Rules

- All components are **Server Components by default**.
- `'use client'` at top of file marks a serialization boundary -- all imports become client bundle.
- Props from Server to Client must be **serializable** (no functions, Date objects, class instances).
- Place `'use client'` as **deep** as possible (only on interactive leaves).

### 2.2 When to Use Each

| Server | Client |
|--------|--------|
| Data fetching (DB, API, secrets) | State (`useState`), event handlers |
| Reduce client JS | Lifecycle effects (`useEffect`) |
| Async component functions | Browser APIs (`window`, `localStorage`) |

### 2.3 Key Patterns

**Interleaving** -- pass Server Components as `children` to Client Components:
```tsx
<ClientModal><ServerCart /></ClientModal>
```

**Context Providers** -- Client Component wrapping Server layout:
```tsx
// providers.tsx -- 'use client'
export function ThemeProvider({ children }) {
  return <ThemeContext.Provider value="dark">{children}</ThemeContext.Provider>;
}
// layout.tsx (Server) -- import and use <ThemeProvider>
```

**Third-party wrapper** for components without `'use client'`:
```tsx
'use client';
export { Carousel as default } from 'acme-carousel';
```

**Environment safety**: `import 'server-only'` / `import 'client-only'` for build-time errors.
Only `NEXT_PUBLIC_*` env vars are exposed to client.

---

## 3. Data Fetching

### 3.1 Server Component Fetching

```tsx
export default async function Page() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

- Identical `fetch` calls are **memoized** within one render pass.
- **v15: fetch is NOT cached by default** (use `cache: 'force-cache'` to opt in).
- ORM/DB queries: use `React.cache()` for deduplication, `unstable_cache()` for caching.

### 3.2 Parallel Fetching

```tsx
const [artist, albums] = await Promise.all([getArtist(id), getAlbums(id)]);
```

### 3.3 Streaming

```tsx
import { Suspense } from 'react';
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />  {/* Streams in when ready */}
</Suspense>
```

`loading.tsx` wraps the entire page segment in `<Suspense>` automatically.

### 3.4 Client-Side with use() (React 19)

```tsx
// Server: pass promise as prop (don't await)
const posts = getPosts();
<Suspense fallback={<Loading />}><PostsList posts={posts} /></Suspense>

// Client: unwrap with use()
'use client';
import { use } from 'react';
export function PostsList({ posts }: { posts: Promise<Post[]> }) {
  const data = use(posts);
  return <ul>{data.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

---

## 4. Server Actions ("use server")

### 4.1 Definition

```tsx
// app/actions.ts
'use server';
export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  await db.post.create({ data: { title: formData.get('title') } });
  revalidatePath('/posts');
  redirect('/posts'); // throws -- call revalidate first
}
```

### 4.2 Usage

- **Forms**: `<form action={createPost}>` (progressive enhancement, works without JS).
- **Event handlers**: `onClick={async () => { await serverFn(); }}` (Client Components only).
- **useActionState** (React 19): `const [state, action, pending] = useActionState(fn, init)`.
- Cannot define in Client Components; must import from `'use server'` file.
- Always verify auth/authz inside every Server Function (reachable via POST).

### 4.3 After Mutation

```tsx
revalidatePath('/posts');     // Invalidate by path
revalidateTag('posts');       // Invalidate by tag
redirect('/posts');           // Redirect (call after revalidate)
// refresh() from 'next/cache' -- re-renders page without full revalidation
```

---

## 5. Caching & Revalidation (v15 Default Model)

### 5.1 fetch() Caching

| Usage | Cached? |
|-------|---------|
| `fetch(url)` | **No** (v15 change) |
| `fetch(url, { cache: 'force-cache' })` | Yes, indefinitely |
| `fetch(url, { next: { revalidate: 3600 } })` | Yes, revalidate every hour |
| `fetch(url, { next: { tags: ['posts'] } })` | Tagged for on-demand revalidation |

### 5.2 Non-fetch Caching (unstable_cache)

```tsx
import { unstable_cache } from 'next/cache';
const getCached = unstable_cache(
  async (id) => db.findById(id),
  ['my-key'],
  { revalidate: 3600, tags: ['data'] }
);
```

### 5.3 Route Segment Config

```tsx
export const revalidate = 600;              // ISR: revalidate every 10 min
export const dynamic = 'force-dynamic';     // Always render at request time
export const dynamic = 'force-static';      // Force static generation
export const fetchCache = 'default-cache';  // Cache all fetches by default
```

### 5.4 On-Demand Revalidation

```tsx
import { revalidatePath, revalidateTag } from 'next/cache';
revalidatePath('/posts');    // Invalidate entire route
revalidateTag('posts');      // Invalidate by tag
```

### 5.5 ISR Pattern

```tsx
export const revalidate = 60;
export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map(p => ({ slug: p.slug }));
}
export default async function Page({ params }) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();
  return <article>{post.title}</article>;
}
```

- `dynamicParams = true` (default): unknown params generated on-demand.
- `dynamicParams = false`: 404 for unknown params.
- Node.js runtime only (not Edge, not static export).
- Multi-instance: use shared cache handler (Redis/S3) + `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`.

---

## 6. Static vs Dynamic Rendering

### Makes a Route Dynamic

- `cookies()`, `headers()`, `searchParams` access
- `fetch()` with `cache: 'no-store'` or `revalidate: 0`
- `export const dynamic = 'force-dynamic'` or `revalidate = 0`

### Keeps a Route Static

- No request-time API usage
- All fetches cached or have `revalidate > 0`
- `generateStaticParams` provides all params
- `export const dynamic = 'force-static'`

---

## 7. v15 Breaking Changes & Pitfalls

### 7.1 Async Request APIs

`cookies()`, `headers()`, `draftMode()`, `params`, `searchParams` are **async Promises**:
```tsx
// v14: const store = cookies();
// v15: const store = await cookies();
```

### 7.2 fetch() Not Cached by Default

v14 cached by default; v15 does not. Explicitly opt in with `cache: 'force-cache'`.

### 7.3 GET Route Handlers Not Cached

Use `export const dynamic = 'force-static'` to opt in.

### 7.4 Client Router Cache Changes

Page segments not reused on `<Link>` navigation (except back/forward). Use `staleTimes`:
```js
experimental: { staleTimes: { dynamic: 30, static: 180 } }
```

### 7.5 React 19 Changes

- `useFormState` deprecated, replaced by `useActionState`.
- `useFormStatus` gains `data`, `method`, `action` keys.
- `React.use()` for unwrapping promises in Client Components.
- `React.cache()` for per-request memoization.

### 7.6 Common Hydration Mismatches

- Browser extensions injecting elements -- `suppressHydrationWarning`.
- Date/time formatting -- format on client or use consistent timezone.
- `typeof window` checks -- move to `useEffect`.

### 7.7 Multi-Instance Deployment

- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` for consistent Server Action encryption.
- `deploymentId` in next.config for version skew protection.
- Shared cache handler for ISR consistency.
- Disable nginx buffering (`X-Accel-Buffering: no`) for streaming.

---

## Reference Files

For deeper API details, read the relevant reference file:

- [./routing-and-config.md](./routing-and-config.md) -- Route Handlers, Middleware, next.config.mjs
- [./image-and-metadata.md](./image-and-metadata.md) -- next/image, Metadata API, OG images
- [./advanced-routing.md](./advanced-routing.md) -- Parallel routes, intercepting routes, error handling
- [./api-functions.md](./api-functions.md) -- Complete API function signatures
- [./cache-components.md](./cache-components.md) -- "use cache" directive (v16+ / opt-in)
