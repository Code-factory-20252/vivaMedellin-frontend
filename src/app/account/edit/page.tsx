'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Camera, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  id: string;
  nombre: string;
  edad: number | null;
  intereses: string[];
  ubicacion: string;
  biografia: string;
  avatar_url: string | null;
}

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    id: '',
    nombre: '',
    edad: null,
    intereses: [],
    ubicacion: '',
    biografia: '',
    avatar_url: null,
  });
  const [currentInteres, setCurrentInteres] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profileData, error } = await supabase
          .from('perfil')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profileData) {
          setProfile({
            id: profileData.id,
            nombre: profileData.nombre || '',
            edad: profileData.edad || null,
            intereses: profileData.intereses || [],
            ubicacion: profileData.ubicacion || '',
            biografia: profileData.biografia || '',
            avatar_url: profileData.avatar_url,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: name === 'edad' ? (value ? parseInt(value) : null) : value,
    }));
  };

  const handleAddInteres = () => {
    if (currentInteres.trim() && !profile.intereses.includes(currentInteres.trim())) {
      setProfile((prev) => ({
        ...prev,
        intereses: [...prev.intereses, currentInteres.trim()],
      }));
      setCurrentInteres('');
    }
  };

  const handleRemoveInteres = (interes: string) => {
    setProfile((prev) => ({
      ...prev,
      intereses: prev.intereses.filter((i) => i !== interes),
    }));
  };

  // ... (imports previos)

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // 1. Eliminar avatar anterior si existe
      const { data: existingFiles } = await supabase.storage.from('avatars').list(user.id + '/');

      if (existingFiles?.length) {
        await supabase.storage
          .from('avatars')
          .remove(existingFiles.map((f) => `${user.id}/${f.name}`));
      }

      // 2. Subir nuevo archivo
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (uploadError) throw uploadError;

      // 3. Obtener URL firmada
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('avatars')
        .createSignedUrl(fileName, 3600); // Válida por 1 hora

      if (urlError) throw urlError;

      // 4. Actualizar estado
      setProfile((prev) => ({
        ...prev,
        avatar_url: signedUrlData?.signedUrl || '',
      }));

      toast.success('Imagen de perfil actualizada');
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      toast.error('Error al actualizar la imagen');
    } finally {
      setUploading(false);
    }
  };

  // ... (resto del componente)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('perfil')
        .update({
          nombre: profile.nombre,
          edad: profile.edad,
          intereses: profile.intereses,
          ubicacion: profile.ubicacion,
          biografia: profile.biografia,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Perfil actualizado correctamente');
      router.push('/account');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
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
          <div className="h-10 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded-lg" />
              <div className="h-12 bg-muted rounded" />
            </div>
            <div className="md:col-span-2 space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/account" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al perfil
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sección de imagen de perfil */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Foto de perfil</CardTitle>
                <CardDescription>Sube una foto que te represente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <Avatar className="h-32 w-32">
                      <AvatarImage
                        src={profile.avatar_url || ''}
                        alt={profile.nombre}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-2xl">
                        {getInitials(profile.nombre || 'U')}
                      </AvatarFallback>
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </Avatar>
                  </div>

                  <div className="mt-4">
                    <Label
                      htmlFor="avatar-upload"
                      className="cursor-pointer text-sm font-medium text-primary hover:underline"
                    >
                      Cambiar foto
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      disabled={uploading}
                    />
                  </div>
                  {uploading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subiendo imagen...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>

          {/* Información del perfil */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información personal</CardTitle>
                <CardDescription>Actualiza tu información personal aquí</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      value={profile.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edad">Edad</Label>
                    <Input
                      id="edad"
                      name="edad"
                      type="number"
                      min="1"
                      max="120"
                      value={profile.edad || ''}
                      onChange={handleChange}
                      placeholder="Tu edad"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    name="ubicacion"
                    value={profile.ubicacion}
                    onChange={handleChange}
                    placeholder="¿Dónde vives?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Intereses</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentInteres}
                      onChange={(e) => setCurrentInteres(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInteres();
                        }
                      }}
                      placeholder="Añadir interés"
                    />
                    <Button type="button" variant="outline" onClick={handleAddInteres}>
                      Añadir
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.intereses.map((interes, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground"
                      >
                        {interes}
                        <button
                          type="button"
                          onClick={() => handleRemoveInteres(interes)}
                          className="ml-2 rounded-full p-0.5 hover:bg-muted-foreground/10"
                        >
                          <span className="sr-only">Eliminar</span>
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biografia">Biografía</Label>
                  <Textarea
                    id="biografia"
                    name="biografia"
                    value={profile.biografia}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Cuéntanos sobre ti..."
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
