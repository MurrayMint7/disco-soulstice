import { adminRouter } from "@disco/admin-feature";
import { eventRouter } from "@disco/events-feature";
import { galleryRouter } from "@disco/gallery-feature";
import { merchRouter } from "@disco/merch-feature";
import { orderRouter } from "@disco/orders-feature";
import { createCallerFactory, createTRPCRouter } from "@disco/trpc";

/**
 * The one place the feature routers are composed. Everything the app can call
 * over tRPC is reachable from here, and nothing else assembles a router.
 */
export const appRouter = createTRPCRouter({
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
 * const res = await trpc.event.list();
 */
export const createCaller = createCallerFactory(appRouter);
