import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
 
export async function middleware(req) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host');
 
  // Check if the request is coming from the main domain (either in development or production)
  const isMainDomain = (process.env.NODE_ENV === 'development' && (hostname === 'localhost:3000' || hostname === 'localhost:3001' || hostname === 'localhost:3002' || hostname === 'localhost:3003' || hostname === 'localhost:3004' || hostname === 'localhost:3005')) || (process.env.NODE_ENV === 'production' && hostname === 'www.plantu.ai');

  // Protect the /newAccount page
  if ((pathname === '/newAccount' || pathname === ('/info')) && !isMainDomain) {
    // If the user is on a subdomain, prevent to open /newAccount page    
    return NextResponse.redirect(new URL('/', req.url));
  }
  else if ( (pathname === ('/forgot-password') || pathname === ('/reset-password') || pathname === ('/setPassword')) && isMainDomain ){
    // If the user is on a Maindomain, Prevent to open these pages
    return NextResponse.redirect(new URL('/info', req.url));
  }

  if (session) {
    if (pathname === ('/post') || pathname === ('/login') || pathname === ('/') || pathname === ('/post') || pathname === ('/account') || pathname === ('/newAccount') || pathname === ('/animation') || pathname === ('/forgot-password') || pathname === ('/setPassword') || pathname === ('/info') || pathname === ('/reset-password')) {
      if (session.role === 'Admin' || session.role === 'user') {
        return NextResponse.redirect(new URL('/post/home', req.url));
      }
      else {
        return NextResponse.redirect(new URL('/post/home', req.url));
      }
    }
  
  }
 
  if (!session) {
    if (pathname.startsWith('/post/') || pathname === ('/post') || pathname === ('/login') || pathname === ('/animation') ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
 
  return NextResponse.next();
}