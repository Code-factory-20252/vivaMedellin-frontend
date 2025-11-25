import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CompleteProfileForm from '@/components/ui/CompleteProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function CompleteProfilePage() {
  const supabase = await createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso requerido</CardTitle>
            <CardDescription>Debes iniciar sesión para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Ir al inicio de sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar si el perfil está completo
  let profile = null;
  try {
    const { data } = await supabase
      .from('perfil')
      .select('*')
      .eq('id_usuario', user.id)
      .limit(1)
      .single();
    profile = data;
  } catch (err) {
    console.error('Error al verificar perfil:', err);
    profile = null;
  }

  if (profile?.completed) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Completa tu perfil</h1>
          <p className="text-muted-foreground">
            Necesitamos algunos datos adicionales para personalizar tu experiencia.
          </p>
        </div>

        <div className="rounded-md bg-amber-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">¡Atención!</h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>No podrás acceder a todas las funcionalidades hasta completar tu perfil.</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent>
            <CompleteProfileForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
