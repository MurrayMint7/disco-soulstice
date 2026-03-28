---
name: Vercel hosting and Postgres
description: The webapp is hosted/deployed on Vercel, database is Vercel Postgres (not Neon separately)
type: project
---

The Disco Soulstice webapp is hosted and deployed through Vercel. The database is Vercel Postgres — `DATABASE_URL` is provided automatically by Vercel.

**Why:** Vercel is the deployment platform — all production env vars, domains, and webhook URLs are configured there.
**How to apply:** When discussing deployment, production config, or database setup, assume Vercel hosting with Vercel Postgres. Do not reference Neon as a separate service.
