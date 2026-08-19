import { postRouter } from "~/server/api/routers/post";
import { eventRouter } from "~/server/api/routers/event";
import { orderRouter } from "~/server/api/routers/order";
import { adminRouter } from "~/server/api/routers/admin";
import { merchRouter } from "~/server/api/routers/merch";
import { galleryRouter } from "~/server/api/routers/gallery";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  event: eventRouter,
  order: orderRouter,
  admin: adminRouter,
  merch: merchRouter,
  gallery: galleryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
