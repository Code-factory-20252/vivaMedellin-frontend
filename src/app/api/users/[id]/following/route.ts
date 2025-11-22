import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/users/[id]/following
 * Get list of users that a specific user is following
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient(cookies());
    const { id: userId } = await params;

    // Get current user to check follow status
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // First, get the list of user IDs being followed
    const { data: followingIds, error: followingError } = await supabase
      .from('seguidores')
      .select('id_seguido')
      .eq('id_seguidor', userId);
    console.log(followingIds);

    if (followingError) {
      console.error('Error fetching following:', followingError);
      return NextResponse.json({ error: 'Failed to fetch following list' }, { status: 500 });
    }

    if (!followingIds || followingIds.length === 0) {
      return NextResponse.json({ following: [] });
    }

    // Extract the user IDs
    const userIds = followingIds.map((f) => f.id_seguido);

    // Now fetch the profile data for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('perfil')
      .select('id, username, nombre, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // Check if current user follows each of these users
    let currentUserFollowingIds = new Set<string>();
    if (currentUser) {
      const { data: currentUserFollowing } = await supabase
        .from('seguidores')
        .select('id_seguido')
        .eq('id_seguidor', currentUser.id);

      currentUserFollowingIds = new Set(currentUserFollowing?.map((f) => f.id_seguido) || []);
    }

    // Format the response
    const following = (profiles || []).map((profile) => ({
      id: profile.id,
      username: profile.username,
      nombre: profile.nombre,
      avatar_url: profile.avatar_url,
      is_following: currentUser ? currentUserFollowingIds.has(profile.id) : false,
    }));

    return NextResponse.json({ following });
  } catch (error) {
    console.error('Unexpected error in get following:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
