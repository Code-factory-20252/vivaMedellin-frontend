import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import CompleteProfileForm from '@/components/ui/CompleteProfileForm';

export default async function CompleteProfilePage() {
  const supabase = await createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <div>Please login to continue</div>;
  }

  let profile = null;
  try {
    const res = await supabase
      .from('perfil')
      .select('*')
      .eq('id_usuario', Number(user.id) || user.id)
      .limit(1)
      .single();
    profile = res.data;
  } catch (err) {
    profile = null;
  }

  if (profile && profile.completed) {
    return <div>Tu perfil ya está completo.</div>;
  }

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Completa tu perfil</h1>
      <CompleteProfileForm />
    </main>
  );
}
