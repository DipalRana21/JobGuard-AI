// middleware.ts
import { withAuth } from "next-auth/middleware";

// withAuth acts as the automatic gatekeeper
export default withAuth({
  pages: {
    signIn: "/login", // If they fail the check, kick them here
  },
});

// This config block tells the middleware WHICH routes to protect
export const config = {

  matcher: [
    "/dashboard/:path*", 
    "/report/:path*",  
  ],
};