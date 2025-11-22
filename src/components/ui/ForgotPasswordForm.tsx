'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor ingrese su correo electrónico');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Error al enviar el correo de recuperación');
        return;
      }

      setIsSuccess(true);
      toast.success(data.message);
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Correo enviado</CardTitle>
          <CardDescription>
            Hemos enviado un enlace de recuperación a tu correo electrónico.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Por favor revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu
            contraseña. El enlace expirará en 10 minutos.
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Volver al inicio de sesión
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>¿Olvidó su contraseña?</CardTitle>
        <CardDescription>
          Ingrese su correo electrónico y le enviaremos instrucciones para restablecer su
          contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push('/login')}
            disabled={isLoading}
          >
            Volver al inicio de sesión
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
