import InputFormat from "@/app/components/Input";

export default function Page() {
  return (
    <div className="flex flex-col items-center gap-5 min-h-screen justify-center">
      <img
        src="/img/logo.png"
        alt="Logo VIVE Medellín"
        className="h-14 mb-4"
      />
      <h2 className="text-slate-700 font-semibold text-2xl leading-9 text-center">
        Inicio de sesión
      </h2>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <InputFormat placeholder="Correo electrónico*" type="email" />
        <InputFormat placeholder="Contraseña*" type="password" />
      </div>
      <a
        href="#"
        className="text-sm text-blue-500 hover:underline self-end pr-4"
      >
        ¿Olvidaste tu contraseña?
      </a>
      <button className="w-full max-w-sm py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition">
        Iniciar sesión
      </button>
    </div>
  );
}
