'use client';
import { useState } from 'react';

export default function ResendForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const form = new FormData();
      form.set('email', email);
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        body: form,
      });
      if (res.ok) setStatus('sent');
      else setStatus('failed');
    } catch (err) {
      setStatus('failed');
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex gap-2 justify-center">
        <input
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <button className="button primary" type="submit">
          {status === 'sending' ? 'Enviando...' : 'Reenviar'}
        </button>
      </form>
      {status === 'sent' && (
        <p className="text-green-600 mt-2">Correo enviado. Revisa tu bandeja de entrada.</p>
      )}
      {status === 'failed' && (
        <p className="text-red-600 mt-2">No se pudo enviar. Intenta más tarde.</p>
      )}
    </div>
  );
}
