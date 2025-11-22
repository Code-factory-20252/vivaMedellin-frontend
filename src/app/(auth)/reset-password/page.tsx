'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResetPasswordForm } from '@/components/ui/ResetPasswordForm';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsValid(true);
      } else {
        router.push('/login');
      }

      setIsChecking(false);
    };

    checkSession();
  }, [router]);

  if (isChecking) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-5 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando enlace de recuperación...</p>
        </div>
      </main>
    );
  }

  if (!isValid) {
    return router.push('/login');
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-5 p-4">
      <ResetPasswordForm />
    </main>
  );
}
