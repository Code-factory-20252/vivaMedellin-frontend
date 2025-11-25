import LoginForm from '../../../components/ui/LoginForm';

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-5">
      <img src="/img/logo.png" alt="Logo" className="h-14 mb-4" />
      <h2 className="text-slate-700 font-semibold text-2xl leading-9 text-center dark:text-slate-300">
        Inicio de sesión
      </h2>
      <LoginForm />
    </main>
  );
}
