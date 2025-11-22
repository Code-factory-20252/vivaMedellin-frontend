'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');

    if (password !== confirmPassword) {
      console.log('ERROR: Passwords do not match');
      toast.error('Las contraseñas no coinciden');
      return;
    }

    console.log('Passwords match, checking regex...');

    // Check each requirement individually for better debugging
    const hasMinLength = password.length >= 8;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[#*_/\-.%?]/.test(password);

    console.log('Password requirements check:');
    console.log('- Min 8 characters:', hasMinLength);
    console.log('- Has lowercase:', hasLowerCase);
    console.log('- Has uppercase:', hasUpperCase);
    console.log('- Has number:', hasNumber);
    console.log('- Has special char (#*_/-.%?):', hasSpecialChar);

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#*_/\-.%?])[A-Za-z\d#*_/\-.%?]{8,}$/;
    const isValid = passwordRegex.test(password);
    console.log('Password regex test result:', isValid);

    if (!isValid) {
      console.log('ERROR: Password does not meet requirements');

      // Show specific error message
      if (!hasMinLength) {
        toast.error('La contraseña debe tener al menos 8 caracteres');
      } else if (!hasLowerCase) {
        toast.error('La contraseña debe incluir al menos una letra minúscula');
      } else if (!hasUpperCase) {
        toast.error('La contraseña debe incluir al  menos una letra MAYÚSCULA');
      } else if (!hasNumber) {
        toast.error('La contraseña debe incluir al menos un número');
      } else if (!hasSpecialChar) {
        toast.error('La contraseña debe incluir al menos un carácter especial: # * _ / - . % ?');
      } else {
        toast.error(
          'La contraseña contiene caracteres no permitidos. Solo se permiten letras, números y: # * _ / - . % ?'
        );
      }
      return;
    }

    console.log('All validations passed!');
    setIsLoading(true);
    console.log('Starting password update...');

    try {
      // Use Supabase client directly to update password
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      // Check session first
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log('Current session:', session);

      if (!session) {
        toast.error('Sesión expirada. Por favor solicite un nuevo enlace de recuperación.');
        setTimeout(() => {
          router.push('/forgot-password');
        }, 2000);
        return;
      }

      console.log('Updating password...');
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      console.log('Update result:', { data, error });

      if (error) {
        console.error('Password update error:', error);
        toast.error('Error al restablecer la contraseña: ' + error.message);
        return;
      }

      console.log('Password updated successfully');
      toast.success('Se cambió la contraseña exitosamente');

      // Sign out to force login with new password
      await supabase.auth.signOut();

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Restablecer contraseña</CardTitle>
        <CardDescription>
          Ingrese su nueva contraseña. Debe tener al menos 8 caracteres con mayúsculas, minúsculas,
          números y caracteres especiales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>La contraseña debe contener:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Mínimo 8 caracteres</li>
              <li>Al menos una mayúscula</li>
              <li>Al menos una minúscula</li>
              <li>Al menos un número</li>
              <li>Al menos un carácter especial (#, *, _, /, -, ., %, ?)</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar contraseña'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
