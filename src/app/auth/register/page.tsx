import RegisterForm from "./register-form"

export default function Page() {
  return <div className="flex flex-col items-center gap-5">
    <h2 className="text-slate-700 font-semibold text-3xl leading-9  text-center">Crea tu cuenta</h2>
    <p className="text-slate-400 font-semibold text-sm leading-5 tracking-[0%] text-center">Únete a la comunidad de eventos más vibrante de Medellín.</p>
    <div className="flex flex-col gap-1.5 w-md">
      <RegisterForm />
    </div>
  </div>
}