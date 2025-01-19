import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Get the pathname of the request
    const path = req.nextUrl.pathname;
    
    // Get the token from the session
    const token = req.nextauth.token;
    
    // If user is signed in and trying to access auth pages (login)
    if (token && path === '/') {
      return NextResponse.redirect(new URL('/upload', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      // Specify which routes this middleware should run on
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Always allow access to Login page
        if (path === '/') {
          return true;
        }
        
        // Require authentication for these routes
        if (path.startsWith('/upload') || path.startsWith('/checkout')) {
          return !!token;
        }
        
        // Allow access to all other routes
        return true;
      },
    },
  }
);

// Configure which routes should be protected
export const config = {
  matcher: ['/upload', '/checkout', '/']
};