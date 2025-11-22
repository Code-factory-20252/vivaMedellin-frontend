import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/users/search
 * Search for users by username or name
 * Query params: q (search query)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ users: [] });
    }

    const supabase = await createClient(cookies());

    // Get current user to exclude from search and check follow status
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // Use the search function created in migration
    const { data: users, error } = await supabase.rpc('search_users', {
      search_query: query.trim(),
      limit_count: 20,
    });

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }

    // Filter out current user from results
    let filteredUsers = users || [];
    if (currentUser) {
      filteredUsers = filteredUsers.filter((user: any) => user.id !== currentUser.id);
    }

    // If user is authenticated, check which users they're following
    if (currentUser && filteredUsers.length > 0) {
      const { data: followingData } = await supabase
        .from('seguidores')
        .select('id_seguido')
        .eq('id_seguidor', currentUser.id);

      const followingIds = new Set(followingData?.map((f) => f.id_seguido) || []);

      const usersWithFollowStatus = filteredUsers.map((user: any) => ({
        ...user,
        is_following: followingIds.has(user.id),
      }));

      return NextResponse.json({ users: usersWithFollowStatus });
    }

    return NextResponse.json({ users: filteredUsers });
  } catch (error) {
    console.error('Unexpected error in search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
