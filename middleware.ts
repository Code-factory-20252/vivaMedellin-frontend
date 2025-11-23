import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { pathname } = request.nextUrl;

  // Skip middleware for public routes and assets
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/error'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isApiRoute = pathname.startsWith('/api');
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/img') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|webp)$/);

  if (isPublicPath || isApiRoute || isStaticAsset) {
    return response;
  }

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not authenticated, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Check profile completion status
  const { data: profile } = await supabase
    .from('perfil')
    .select('completed')
    .eq('id', user.id)
    .maybeSingle();

  const isCompleted = profile?.completed === true;
  const isOnCompletePage = pathname.startsWith('/account/complete');

  // If profile is NOT completed and user is NOT on complete page -> redirect to complete
  if (!isCompleted && !isOnCompletePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/account/complete';
    return NextResponse.redirect(url);
  }

  // If profile IS completed and user IS on complete page -> redirect to dashboard
  if (isCompleted && isOnCompletePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, other icons
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
