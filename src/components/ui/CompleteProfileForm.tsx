'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAlert } from './Toast';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import CustomLabel from './CustomLabel';

const INTERESTS = [
  'Arte',
  'Deporte',
  'Música',
  'Estilo de Vida',
  'Tecnología',
  'Comunidades',
  'Otros',
] as const;

const profileSchema = z.object({
  nombre: z
    .string()
    .min(1)
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, { message: 'El nombre sólo puede contener letras y espacios' }),
  edad: z.preprocess((v) => Number(v), z.number().int().min(1).max(120)),
  intereses: z.array(z.string()).min(1),
  interes_otro: z.string().max(40).optional(),
  ubicacion: z.string().min(1),
  biografia: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof profileSchema>;

export default function CompleteProfileForm() {
  const alert = useAlert();
  const [sending, setSending] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      nombre: '',
      edad: 18,
      intereses: [],
      interes_otro: '',
      ubicacion: '',
      biografia: '',
    },
  });

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return setAvatarFile(null);
    if (!['image/png', 'image/jpeg'].includes(f.type)) {
      alert.show({
        title: 'Error',
        description: 'Formato no soportado. Use PNG o JPG.',
        variant: 'destructive',
      });
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      alert.show({
        title: 'Error',
        description:
          'El archivo excede el tamaño máximo permitido (2MB). Por favor, selecciona una imagen más ligera.',
        variant: 'destructive',
      });
      return;
    }
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  }

  async function uploadAvatar(file: File, userId: string) {
    const supabase = createBrowserClient();
    const path = `${userId}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { contentType: file.type });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    return urlData.publicUrl;
  }

  async function onSubmit(values: FormValues) {
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id ?? null;

    let avatarUrl: string | undefined;
    if (avatarFile && userId) {
      try {
        avatarUrl = await uploadAvatar(avatarFile, String(userId));
        alert.show({ title: 'La imagen de perfil se ha cargado exitosamente.' });
      } catch (e) {
        alert.show({
          title: 'Error',
          description: 'No se pudo subir la imagen',
          variant: 'destructive',
        });
        return;
      }
    }

    const payload = { ...values, avatar_url: avatarUrl };
    const res = await fetch('/api/profile/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      alert.show({
        title: 'Perfil guardado',
        description: 'Tu perfil ha sido creado correctamente.',
      });
      window.location.href = '/account';
    } else {
      const j = await res.json().catch(() => null);
      alert.show({
        title: 'Error',
        description: j?.message ?? 'No se pudo guardar el perfil',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="max-w-2xl">
      <section>
        <h2 className="font-semibold">Datos personales</h2>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <div>
            <CustomLabel>Nombre completo</CustomLabel>
            <CustomInput {...form.register('nombre')} />
            {form.formState.errors.nombre && (
              <div className="text-sm text-red-600">
                {String(form.formState.errors.nombre.message)}
              </div>
            )}
          </div>

          <div>
            <CustomLabel>Edad</CustomLabel>
            <CustomInput type="number" {...form.register('edad')} />
            {form.formState.errors.edad && (
              <div className="text-sm text-red-600">
                {String(form.formState.errors.edad.message)}
              </div>
            )}
          </div>

          <div>
            <CustomLabel>Intereses</CustomLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {INTERESTS.map((i) => (
                <label key={i} className="inline-flex items-center gap-2">
                  <input type="checkbox" value={i} {...form.register('intereses')} />
                  <span>{i}</span>
                </label>
              ))}
            </div>
            {form.watch('intereses')?.includes('Otros') && (
              <div className="mt-2">
                <CustomLabel>Especifica tu interés</CustomLabel>
                <CustomInput {...form.register('interes_otro')} />
              </div>
            )}
          </div>

          <div>
            <CustomLabel>Ubicación</CustomLabel>
            <select {...form.register('ubicacion')} className="w-full border p-2 rounded">
              <option value="">Selecciona municipio</option>
              <option>Medellín</option>
              <option>Bello</option>
              <option>Envigado</option>
              <option>Itagüí</option>
              <option>Sabaneta</option>
              <option>La Estrella</option>
              <option>Copacabana</option>
              <option>Caldas</option>
              <option>Barbosa</option>
              <option>Girardota</option>
            </select>
          </div>

          <div>
            <CustomLabel>Foto de perfil</CustomLabel>
            <input type="file" accept="image/png,image/jpeg" onChange={onFileChange} />
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="preview"
                className="w-24 h-24 object-cover rounded-full mt-2"
              />
            )}
          </div>

          <div>
            <CustomLabel>Biografía (opcional)</CustomLabel>
            <textarea
              maxLength={500}
              {...form.register('biografia')}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <CustomButton type="submit" disabled={!form.formState.isValid}>
              Guardar
            </CustomButton>
          </div>
        </form>
      </section>
    </div>
  );
}
