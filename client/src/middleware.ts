import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Supabase docs:
export async function middleware(request: NextRequest) {
    // update user's auth session
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */

        // Public routes:
        "/((?!_next/static|_next/image|favicon.ico|login|auth/confirm|$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
