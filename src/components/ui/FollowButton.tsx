'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { followUser, unfollowUser } from '@/lib/search-utils';
import { toast } from 'sonner';

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function FollowButton({
  userId,
  isFollowing: initialIsFollowing,
  onFollowChange,
  variant = 'default',
  size = 'default',
  showText = true,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isFollowing) {
        const { data, error } = await unfollowUser(userId);
        if (error) {
          toast.error(error);
        } else {
          setIsFollowing(false);
          toast.success(data?.message || 'Usted ha dejado de seguir a este usuario');
          if (onFollowChange) onFollowChange(false);
        }
      } else {
        const { data, error } = await followUser(userId);
        if (error) {
          toast.error(error);
        } else {
          setIsFollowing(true);
          toast.success(data?.message || 'Usted ha empezado a seguir este usuario');
          if (onFollowChange) onFollowChange(true);
        }
      }
    } catch (error) {
      toast.error('Error al actualizar el estado de seguimiento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={isFollowing ? 'hover:bg-destructive hover:text-destructive-foreground' : ''}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          {showText && <span className="ml-2">Siguiendo</span>}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          {showText && <span className="ml-2">Seguir</span>}
        </>
      )}
    </Button>
  );
}
