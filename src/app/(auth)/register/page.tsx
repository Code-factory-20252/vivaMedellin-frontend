import { Suspense } from 'react';
import RegisterForm from '../../../components/ui/RegisterForm';

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-5">
      <h2 className="text-slate-700 font-semibold text-3xl leading-9 text-center  dark:text-slate-300">
        Crea tu cuenta
      </h2>
      <p className="text-slate-400 font-semibold text-sm leading-5 tracking-[0%] text-center  dark:text-slate-400">
        Únete a la comunidad de eventos más vibrante
      </p>
      <div className="w-md">
        <Suspense fallback={<p>Cargando formulario...</p>}>
          <RegisterForm />
        </Suspense>
      </div>
    </main>
  );
}
