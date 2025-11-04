'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAlert } from './Toast';

export default function DashboardAlert() {
  const params = useSearchParams();
  const msg = params.get('msg');
  const desc = params.get('desc');
  const alert = useAlert();
  const router = useRouter();

  useEffect(() => {
    if (msg) {
      const text =
        desc ??
        (msg === 'login_success' ? 'Has iniciado sesión con éxito.' : 'Operación completada.');
      alert.show({
        title: msg === 'login_success' ? 'Ha iniciado sesión con éxito' : 'Operación',
        description: text,
        variant: 'default',
      });
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('msg');
        url.searchParams.delete('desc');
        router.replace(url.pathname + url.search);
      } catch (e) {}
    }
  }, [msg, desc, alert, router]);

  return null;
}
