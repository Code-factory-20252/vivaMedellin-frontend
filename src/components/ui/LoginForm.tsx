'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAlert } from './Toast';

import CustomInput from '@/components/ui/CustomInput';
import CustomButton from '@/components/ui/CustomButton';
import CustomLabel from '@/components/ui/CustomLabel';

const loginSchema = z.object({
  email: z.email('El correo electrónico no es válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export default function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    const formData = new FormData();
    formData.set('email', values.email);
    formData.set('password', values.password);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      });
      if (res.redirected) {
        alert.show({
          title: 'Ha iniciado sesión con éxito',
          description: 'Redirigiendo...',
          variant: 'default',
        });
        setTimeout(() => {
          window.location.href = res.url;
        }, 500);
        return;
      }
      alert.show({
        title: 'Error',
        description: 'No se pudo iniciar sesión',
        variant: 'destructive',
      });
      setLoading(false);
      window.location.href = '/error';
    } catch (e) {
      alert.show({
        title: 'Error',
        description: 'No se pudo iniciar sesión',
        variant: 'destructive',
      });
      setLoading(false);
      window.location.href = '/error';
    }
  }
  const alert = useAlert();
  const [loading, setLoading] = React.useState(false);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full max-w-sm">
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <CustomLabel htmlFor={field.name}>Correo electrónico</CustomLabel>
              <FormControl>
                <CustomInput
                  id={field.name}
                  type="email"
                  placeholder="Ingrese su correo electrónico"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <CustomLabel htmlFor={field.name}>Contraseña</CustomLabel>
              <FormControl>
                <CustomInput
                  id={field.name}
                  type="password"
                  placeholder="Ingrese su contraseña"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Forgot password */}
        <a href="/forgot-password" className="text-sm text-blue-500 hover:underline self-end">
          ¿Olvidó su contraseña?
        </a>

        {/* Submit button */}
        <CustomButton type="submit" disabled={loading}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-75"
                />
              </svg>
              Iniciando...
            </span>
          ) : (
            'Iniciar sesión'
          )}
        </CustomButton>
      </form>
    </Form>
  );
}
