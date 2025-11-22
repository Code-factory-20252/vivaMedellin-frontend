'use client';

import { FollowingUser } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FollowButton } from '@/components/ui/FollowButton';
import Link from 'next/link';
import { Users } from 'lucide-react';

interface FollowingListProps {
  users: FollowingUser[];
  emptyMessage?: string;
}

export function FollowingList({ users, emptyMessage }: FollowingListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Sin usuarios seguidos</h3>
        <p className="text-sm text-muted-foreground">
          {emptyMessage || 'Ups! parece que aún no sigues a nadie'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <Link href={`/users/${user.id}`} className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || ''} alt={user.nombre} />
              <AvatarFallback>{getInitials(user.nombre || user.username)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium hover:underline">{user.nombre || user.username}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </Link>
          <FollowButton userId={user.id} isFollowing={user.is_following} size="sm" />
        </div>
      ))}
    </div>
  );
}
