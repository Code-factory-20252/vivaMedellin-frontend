'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Calendar, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion: string;
  imagen_url?: string;
}

export default function Dashboard() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Cargar todos los eventos
      const { data: eventosData } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha_inicio', { ascending: true });

      // Cargar eventos favoritos del usuario
      const { data: favoritosData } = await supabase
        .from('eventos_favoritos')
        .select('id_evento')
        .eq('id_usuario', user?.id);

      setEventos(eventosData || []);
      setFavoritos(favoritosData?.map(f => f.id_evento) || []);
      setLoading(false);
    };

    cargarDatos();
  }, []);

  const toggleFavorito = async (evento: Evento) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const esFavorito = favoritos.includes(evento.id);

    try {
      if (esFavorito) {
        await supabase
          .from('eventos_favoritos')
          .delete()
          .eq('id_usuario', user.id)
          .eq('id_evento', evento.id);
      } else {
        await supabase
          .from('eventos_favoritos')
          .insert([
            { 
              id_usuario: user.id, 
              id_evento: evento.id,
              titulo_evento: evento.titulo
            }
          ]);
      }

      setFavoritos(prev => 
        esFavorito 
          ? prev.filter(id => id !== evento.id)
          : [...prev, evento.id]
      );
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explora Eventos</h1>
        <p className="text-muted-foreground">
          Descubre los mejores eventos en Medellín y guárdalos en tus favoritos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map((evento) => {
          const esFavorito = favoritos.includes(evento.id);
          
          return (
            <Card key={evento.id} className="overflow-hidden transition-all hover:shadow-lg">
              {evento.imagen_url && (
                <div className="relative h-48 w-full">
                  <img
                    src={evento.imagen_url}
                    alt={evento.titulo}
                    className="h-full w-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={() => toggleFavorito(evento)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        esFavorito ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                      }`}
                    />
                  </Button>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="line-clamp-1">{evento.titulo}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">
                  {evento.descripcion}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDate(evento.fecha_inicio)}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>
                    {formatTime(evento.fecha_inicio)} - {formatTime(evento.fecha_fin)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="line-clamp-1">{evento.ubicacion}</span>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/eventos/${evento.id}`}>Ver más detalles</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}