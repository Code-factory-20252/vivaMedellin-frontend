'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, User, Mail, Heart, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { FollowButton } from '@/components/ui/FollowButton';
import { FollowingList } from '@/components/ui/FollowingList';
import { FollowingUser } from '@/lib/types';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  username: string;
  edad?: number;
  ubicacion?: string;
  intereses?: string[];
  biografia?: string;
  avatar_url?: string;
  total_seguidores: number;
  total_siguiendo: number;
  total_eventos_favoritos: number;
  is_following: boolean;
}

interface EventoFavorito {
  id: string;
  titulo_evento: string;
  creado_en: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [eventosFavoritos, setEventosFavoritos] = useState<EventoFavorito[]>([]);
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('favoritos');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        // Redirect to account page if trying to view own profile
        if (currentUser && currentUser.id === userId) {
          router.push('/account');
          return;
        }

        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Usuario no encontrado');
            router.push('/dashboard');
          } else if (response.status === 403) {
            router.push('/account');
          }
          return;
        }

        const data = await response.json();
        const { data: favoritosData } = await supabase
          .from('eventos_favoritos')
          .select('*')
          .eq('id_usuario', data.profile.id)
          .order('creado_en', { ascending: false });
        setProfile(data.profile);
        setEventosFavoritos(favoritosData || []);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, router]);

  useEffect(() => {
    if (activeTab === 'siguiendo') {
      loadFollowing();
    }
  }, [activeTab, userId]);

  const loadFollowing = async () => {
    setLoadingFollowing(true);
    try {
      const response = await fetch(`/api/users/${userId}/following`);
      const data = await response.json();
      setFollowing(data.following || []);
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <Skeleton className="h-10 w-32" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Perfil no encontrado</h2>
        <Button asChild>
          <Link href="/dashboard">Volver al dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="items-center text-center pb-2">
              <div className="flex justify-center items-center">
                <Avatar className="h-32 w-32 ring-4 ring-background">
                  <AvatarImage
                    src={profile.avatar_url || ''}
                    alt={profile.nombre}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                    {getInitials(profile.nombre || 'U')}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2 mt-4 w-full">
                <CardTitle className="text-2xl">{profile.nombre}</CardTitle>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm truncate">{profile.email}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 px-6">
              {/* User Details */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                {profile.edad && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">
                    <User className="h-3.5 w-3.5" />
                    <span>{profile.edad} años</span>
                  </div>
                )}

                {profile.ubicacion && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{profile.ubicacion}</span>
                  </div>
                )}
              </div>

              {profile.biografia && (
                <div className="pt-3 border-t">
                  <h3 className="text-sm font-semibold mb-2">Sobre mí</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profile.biografia}
                  </p>
                </div>
              )}

              {profile.intereses && profile.intereses.length > 0 && (
                <div className="pt-3 border-t">
                  <h4 className="text-sm font-semibold mb-2.5">Intereses</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.intereses.map((interes, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interes}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            {/* Follow Button */}
            <CardFooter className="pt-4 px-6 pb-6">
              <FollowButton
                userId={profile.id}
                isFollowing={profile.is_following}
                variant="default"
                onFollowChange={(isFollowing) => {
                  setProfile({
                    ...profile,
                    is_following: isFollowing,
                    total_seguidores: profile.total_seguidores + (isFollowing ? 1 : -1),
                  });
                }}
                showText={true}
                size="lg"
              />
            </CardFooter>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Seguidores</span>
                </div>
                <span className="font-semibold">{profile.total_seguidores || 0}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Siguiendo</span>
                </div>
                <span className="font-semibold">{profile.total_siguiendo || 0}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Eventos favoritos</span>
                </div>
                <span className="font-semibold">{profile.total_eventos_favoritos || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Actividad</CardTitle>
              <CardDescription>Eventos favoritos y usuarios seguidos</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="favoritos">
                    <Heart className="mr-2 h-4 w-4" />
                    Eventos Favoritos
                  </TabsTrigger>
                  <TabsTrigger value="siguiendo">
                    <Users className="mr-2 h-4 w-4" />
                    Seguidos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="favoritos" className="mt-6">
                  {eventosFavoritos.length > 0 ? (
                    <div className="space-y-4">
                      {eventosFavoritos.map((evento) => (
                        <div
                          key={evento.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div>
                            <h4 className="font-medium">{evento.titulo_evento}</h4>
                            <p className="text-sm text-muted-foreground">
                              Añadido el{' '}
                              {new Date(evento.creado_en).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/eventos/${evento.id}`}>Ver evento</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Heart className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="mt-2 text-sm font-medium">Sin eventos favoritos</h3>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="siguiendo" className="mt-6">
                  {loadingFollowing ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Cargando...</p>
                    </div>
                  ) : (
                    <FollowingList
                      users={following}
                      emptyMessage="Ups! parece que aún no sigue a nadie"
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
