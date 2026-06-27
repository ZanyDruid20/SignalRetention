import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/customers(.*)",
  "/datasets(.*)",
  "/predictions(.*)",
  "/recommendations(.*)",
  "/settings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/customers(.*)",
    "/datasets(.*)",
    "/predictions(.*)",
    "/recommendations(.*)",
    "/settings(.*)",
  ],
};
