// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
    "/dashboard",
    // "/organizations",
    "/project-dockets",
    "/datasets",
    // "/user-management",
    // "/audit-logs",
    // "/forms",
    // "/request-approval",
    // "/role-access",
    // "/settings",
    
];

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value || null;
    const { pathname } = request.nextUrl;

    console.log("token", token);
    console.log("pathname", pathname);

    // Block access to protected routes without token
    if ((!token || token === "undefined")  && protectedRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Prevent logged-in user from going back to login page
    if (token && pathname === "/") {
        // return NextResponse.redirect(new URL("/dashboard", request.url));
        return NextResponse.redirect(new URL("/organizations", request.url));
    }

    return NextResponse.next();
}

// Define paths where middleware should apply
export const config = {
    matcher: [
        "/",
        "/dashboard",
        // "/organizations",
        "/project-dockets",
        "/datasets",
        // "/user-management",
        // "/audit-logs",
        // "/forms",
        // "/request-approval",
        // "/role-access",
        // "/settings",
    ],
};
// middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { jwtVerify } from "jose";

// const protectedRoutes = [
//   "/dashboard",
//   "/organizations",
//   "/project-dockets",
//   "/datasets",
//   "/user-management",
//   "/audit-logs",
//   "/forms",
//   "/request-approval",
//   "/role-access",
//   "/settings",
// ];

// async function isValidToken(token: string | null): Promise<boolean> {
//   if (!token || token === "undefined" || token === "null" || token.trim() === "") {
//     return false;
//   }

//   try {
//     const secret = new TextEncoder().encode(process.env.JWT_SECRET);
//     await jwtVerify(token, secret); // ⏱ auto-checks expiration too
//     return true;
//   } catch {
//     return false;
//   }
// }

// export async function middleware(request: NextRequest) {
//   const token = request.cookies.get("token")?.value || null;
//   const pathname = request.nextUrl.pathname;

//   const isTokenValid = await isValidToken(token);
//   console.log("isTokenValid", isTokenValid);

//   if (!isTokenValid && protectedRoutes.some((route) => pathname.startsWith(route))) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   if (isTokenValid && pathname === "/") {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", ...protectedRoutes],
// };

