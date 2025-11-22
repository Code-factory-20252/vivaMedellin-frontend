import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/users/[id]
 * Get user profile by ID with stats
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient(cookies());
    const { id: userId } = await params;

    // Get current user
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    // Prevent viewing own profile through this endpoint
    if (currentUser && currentUser.id === userId) {
      return NextResponse.json(
        { error: 'Para ver tu propio perfil debes ir a Mi Perfil' },
        { status: 403 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('perfil')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get stats about follower, following and events
    const { data: stats } = await supabase
      .from('vista_contadores_perfil')
      .select('*')
      .eq('id_usuario', userId)
      .single();

    // Check if following
    let isFollowing = false;
    if (currentUser && currentUser.id !== userId) {
      const { data: followData } = await supabase
        .from('seguidores')
        .select('*')
        .eq('id_seguidor', currentUser.id)
        .eq('id_seguido', userId)
        .single();

      isFollowing = !!followData;
    }

    // Get favorite events
    const { data: favoriteEvents } = await supabase
      .from('eventos_favoritos')
      .select('*')
      .eq('id_usuario', userId)
      .order('creado_en', { ascending: false });

    return NextResponse.json({
      profile: {
        ...profile,
        ...stats,
        is_following: isFollowing,
      },
      favoriteEvents: favoriteEvents || [],
    });
  } catch (error) {
    console.error('Unexpected error in get user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
