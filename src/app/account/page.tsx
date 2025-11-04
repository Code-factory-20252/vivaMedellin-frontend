'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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
import {
  MapPin,
  Calendar,
  User,
  Mail,
  Heart,
  Users,
  Calendar as CalendarIcon,
  ArrowLeft,
  Edit,
} from 'lucide-react';
import Link from 'next/link';

interface Perfil {
  id: string;
  nombre: string;
  email: string;
  edad: number;
  intereses: string[];
  ubicacion: string;
  biografia: string;
  avatar_url: string;
  total_seguidores: number;
  total_siguiendo: number;
  total_eventos_favoritos: number;
}

interface EventoFavorito {
  id: string;
  titulo_evento: string;
  creado_en: string;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<Perfil | null>(null);
  const [eventosFavoritos, setEventosFavoritos] = useState<EventoFavorito[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const cargarDatos = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Cargar perfil del usuario
      const { data: perfilData } = await supabase
        .from('perfil')
        .select(
          `
          *
        `
        )
        .eq('id', user.id)
        .single();

      // Cargar contadores de perfil
      const { data: contadoresData } = await supabase
        .from('vista_contadores_perfil')
        .select('*')
        .eq('id_usuario', user.id)
        .single();

      // Cargar eventos favoritos
      const { data: favoritosData } = await supabase
        .from('eventos_favoritos')
        .select('*')
        .eq('id_usuario', user.id)
        .order('creado_en', { ascending: false });

      if (perfilData) {
        setProfile({
          ...perfilData,
          ...perfilData.perfil_complementario,
          ...contadoresData,
        });
      }

      setEventosFavoritos(favoritosData || []);
      setLoading(false);
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Perfil no encontrado</h2>
        <p className="text-muted-foreground mb-4">No se pudo cargar la información del perfil.</p>
        <Button asChild>
          <Link href="/account/edit">Completar perfil</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sección de perfil lateral */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="items-center text-center justify-center pb-2">
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
                  <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm truncate max-w-[200px]" title={profile?.email}>
                    {profile?.email}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 px-6">
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                {profile.edad && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 transition-colors hover:bg-muted">
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{profile.edad} años</span>
                  </div>
                )}

                {profile.ubicacion && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 transition-colors hover:bg-muted">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate max-w-[150px]" title={profile.ubicacion}>
                      {profile.ubicacion}
                    </span>
                  </div>
                )}
              </div>

              {profile.biografia && (
                <div className="pt-3 border-t">
                  <h3 className="text-sm font-semibold mb-2 text-foreground">Sobre mí</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {profile.biografia}
                  </p>
                </div>
              )}

              {profile.intereses && profile.intereses.length > 0 && (
                <div className="pt-3 border-t">
                  <h4 className="text-sm font-semibold mb-2.5 text-foreground">Intereses</h4>
                  <div
                    className="flex flex-wrap gap-2"
                    role="list"
                    aria-label="Intereses del usuario"
                  >
                    {profile.intereses.map((interes, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs px-2.5 py-1 transition-all duration-200 hover:scale-105 hover:shadow-sm cursor-default"
                        role="listitem"
                      >
                        {interes}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4 px-6 pb-6">
              <Button
                asChild
                variant="outline"
                className="w-full group transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                <Link href="/account/edit" className="flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                  <span>Editar perfil</span>
                </Link>
              </Button>
            </CardFooter>
          </Card>

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

        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
              <CardDescription>Tu actividad y eventos recientes</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="favoritos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="favoritos">
                    <Heart className="mr-2 h-4 w-4" />
                    Eventos favoritos
                  </TabsTrigger>
                  <TabsTrigger value="actividad">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Actividad reciente
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        Comienza a marcar eventos como favoritos para verlos aquí.
                      </p>
                      <div className="mt-6">
                        <Button asChild>
                          <Link href="/dashboard">Explorar eventos</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="actividad" className="mt-6">
                  <div className="text-center py-8">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium">Sin actividad reciente</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tu actividad aparecerá aquí.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
