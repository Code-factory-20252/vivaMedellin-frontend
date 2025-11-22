import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/users/[id]/follow
 * Follow a user
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient(cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userIdToFollow } = await params;

    // Prevent self-following (also checked by database constraint)
    if (user.id === userIdToFollow) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('seguidores')
      .select('*')
      .eq('id_seguidor', user.id)
      .eq('id_seguido', userIdToFollow)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already following this user' }, { status: 400 });
    }

    // Create follow relationship
    const { error: followError } = await supabase.from('seguidores').insert({
      id_seguidor: user.id,
      id_seguido: userIdToFollow,
    });

    if (followError) {
      console.error('Follow error:', followError);
      return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
    }

    // Get updated counts
    const { data: counts } = await supabase
      .from('vista_contadores_perfil')
      .select('total_seguidores, total_siguiendo')
      .eq('id_usuario', user.id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Usted ha empezado a seguir este usuario',
      total_seguidores: counts?.total_seguidores || 0,
      total_siguiendo: counts?.total_siguiendo || 0,
    });
  } catch (error) {
    console.error('Unexpected error in follow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id]/follow
 * Unfollow a user
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient(cookies());
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userIdToUnfollow } = await params;

    // Delete follow relationship
    const { error: unfollowError } = await supabase
      .from('seguidores')
      .delete()
      .eq('id_seguidor', user.id)
      .eq('id_seguido', userIdToUnfollow);

    if (unfollowError) {
      console.error('Unfollow error:', unfollowError);
      return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
    }

    // Get updated counts
    const { data: counts } = await supabase
      .from('vista_contadores_perfil')
      .select('total_seguidores, total_siguiendo')
      .eq('id_usuario', user.id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Usted ha dejado de seguir a este usuario',
      total_seguidores: counts?.total_seguidores || 0,
      total_siguiendo: counts?.total_siguiendo || 0,
    });
  } catch (error) {
    console.error('Unexpected error in unfollow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
