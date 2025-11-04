'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import CustomInput from '@/components/ui/CustomInput';
import CustomButton from '@/components/ui/CustomButton';
import CustomLabel from '@/components/ui/CustomLabel';
import Link from 'next/link';
import React from 'react';
import { useAlert } from './Toast';

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
      .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'El nombre de usuario solo puede contener letras, números y guiones bajos'
      )
      .nonempty('El nombre de usuario es obligatorio'),
    email: z
      .string()
      .email('El formato del correo electrónico no es válido')
      .nonempty('El correo electrónico es obligatorio'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial'
      ),
    confirmPassword: z.string().nonempty('Por favor, confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const alert = useAlert();
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = React.useState(false);
  const [checkingEmail, setCheckingEmail] = React.useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const checkUsernameAvailability = React.useMemo(() => {
    const debounce = (func: Function, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };

    return debounce(async (username: string) => {
      if (username.length < 3) return;

      setCheckingUsername(true);
      try {
        const response = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(username)}`
        );
        const data = await response.json();

        if (data.exists) {
          form.setError('username', {
            type: 'manual',
            message: 'El nombre de usuario ya está en uso',
          });
        } else {
          form.clearErrors('username');
        }
      } catch (error) {
        console.error('Error checking username:', error);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);
  }, [form]);

  const checkEmailAvailability = React.useMemo(() => {
    const debounce = (func: Function, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };

    return debounce(async (email: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

      setCheckingEmail(true);
      try {
        const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (!data.valid) {
          form.setError('email', {
            type: 'manual',
            message: data.message || 'El correo electrónico no es válido',
          });
        } else if (data.exists) {
          form.setError('email', {
            type: 'manual',
            message: 'El correo electrónico ya está registrado',
          });
        } else {
          form.clearErrors('email');
        }
      } catch (error) {
        console.error('Error checking email:', error);
        form.clearErrors('email');
      } finally {
        setCheckingEmail(false);
      }
    }, 500);
  }, [form]);

  React.useEffect(() => {
    const error = searchParams.get('error');
    const field = searchParams.get('field');

    if (error) {
      setServerError(error);
      if (field) {
        setFieldError(field);
        const fieldElement = document.getElementById(field);
        if (fieldElement) {
          fieldElement.focus();
        }
      }

      setTimeout(() => {
        setServerError(null);
        setFieldError(null);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('error');
        newUrl.searchParams.delete('field');
        window.history.replaceState({}, '', newUrl.toString());
      }, 5000);
    }
  }, [searchParams]);

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setLoading(true);
    setServerError(null);
    setFieldError(null);

    const formData = new FormData();
    formData.set('email', values.email);
    formData.set('password', values.password);
    formData.set('username', values.username);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      });
      if (res.redirected) {
        alert.show({
          title: 'Registro exitoso',
          description: 'Revisa tu correo para confirmar',
          variant: 'default',
        });
        setTimeout(() => {
          window.location.href = res.url;
        }, 500);
        return;
      }
      alert.show({
        title: 'Error',
        description: 'No se pudo completar el registro',
        variant: 'destructive',
      });
      setLoading(false);
      window.location.href = '/error';
    } catch (e) {
      alert.show({
        title: 'Error',
        description: 'No se pudo completar el registro',
        variant: 'destructive',
      });
      setLoading(false);
      window.location.href = '/error';
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="font-medium">Error en el registro:</p>
              <p>{serverError}</p>
            </div>
          )}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <CustomLabel htmlFor={field.name}>Nombre de Usuario</CustomLabel>
                <FormControl>
                  <div className="relative">
                    <CustomInput
                      id={field.name}
                      type="text"
                      placeholder="Ingrese un nombre de usuario único"
                      className={`${fieldError === 'username' ? 'border-red-500 focus:border-red-500' : ''}
                               ${form.formState.errors.username ? 'border-red-500 focus:border-red-500' : ''}
                               ${checkingUsername ? 'border-blue-500' : ''}`}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        checkUsernameAvailability(e.target.value);
                      }}
                    />
                    {checkingUsername && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-4 h-4 animate-spin text-blue-500"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
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
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <CustomLabel htmlFor={field.name}>Correo electrónico</CustomLabel>
                <FormControl>
                  <div className="relative">
                    <CustomInput
                      id={field.name}
                      type="email"
                      placeholder="Ingrese el correo electrónico"
                      className={`${fieldError === 'email' ? 'border-red-500 focus:border-red-500' : ''}
                               ${form.formState.errors.email ? 'border-red-500 focus:border-red-500' : ''}
                               ${checkingEmail ? 'border-blue-500' : ''}`}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        checkEmailAvailability(e.target.value);
                      }}
                    />
                    {checkingEmail && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="w-4 h-4 animate-spin text-blue-500"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
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
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    placeholder="Crea una contraseña"
                    className={
                      form.formState.errors.password ? 'border-red-500 focus:border-red-500' : ''
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {/* Indicador visual de requisitos de contraseña */}
                {field.value && (
                  <div className="text-sm text-gray-600 mt-1">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`text-xs ${field.value.length >= 8 ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {field.value.length >= 8 ? '✓' : '✗'} 8+ caracteres
                      </span>
                      <span
                        className={`text-xs ${/[A-Z]/.test(field.value) ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {/[A-Z]/.test(field.value) ? '✓' : '✗'} Mayúscula
                      </span>
                      <span
                        className={`text-xs ${/[a-z]/.test(field.value) ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {/[a-z]/.test(field.value) ? '✓' : '✗'} Minúscula
                      </span>
                      <span
                        className={`text-xs ${/[0-9]/.test(field.value) ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {/[0-9]/.test(field.value) ? '✓' : '✗'} Número
                      </span>
                      <span
                        className={`text-xs ${/[#?!@$%^&*-]/.test(field.value) ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {/[#?!@$%^&*-]/.test(field.value) ? '✓' : '✗'} Carácter especial
                      </span>
                    </div>
                  </div>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <CustomLabel htmlFor={field.name}>Confirmar contraseña</CustomLabel>
                <FormControl>
                  <CustomInput
                    id={field.name}
                    type="password"
                    placeholder="Vuelva a ingresar la contraseña"
                    className={
                      form.formState.errors.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {/* Indicador visual de coincidencia de contraseñas */}
                {field.value && form.watch('password') && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span
                      className={`text-xs ${field.value === form.watch('password') ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {field.value === form.watch('password') ? '✓' : '✗'} Las contraseñas coinciden
                    </span>
                  </div>
                )}
              </FormItem>
            )}
          />
          <CustomButton
            type="submit"
            disabled={loading || !form.formState.isValid}
            className={
              !form.formState.isValid && Object.keys(form.formState.errors).length > 0
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }
          >
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
                Registrando...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                {Object.keys(form.formState.errors).length > 0 && (
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                )}
                Registrarse
              </span>
            )}
          </CustomButton>

          {/* Estado del formulario para debugging */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
              <div>Form Valid: {form.formState.isValid ? '✅' : '❌'}</div>
              <div>Errors: {Object.keys(form.formState.errors).length}</div>
              <div>
                Dirty Fields: {Object.keys(form.formState.dirtyFields).join(', ') || 'none'}
              </div>
            </div>
          )}
          <p className="self-center leading-2 text-slate-700">
            ¿Ya tienes cuenta?{' '}
            <Link className="font-semibold text-sky-500" href="./login">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </Form>
    </>
  );
}
