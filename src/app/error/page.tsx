import ResendForm from '@/components/ui/ResendForm'

export default function ErrorPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const error_description = Array.isArray(searchParams.error_description) ? searchParams.error_description[0] : searchParams.error_description
  const error_code = Array.isArray(searchParams.error_code) ? searchParams.error_code[0] : searchParams.error_code

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Error de autenticación</h1>
        <p className="mb-4 text-gray-700">
          {error_description ?? 'Hubo un problema al iniciar sesión o crear la cuenta. Inténtalo de nuevo.'}
        </p>

        {error_code === 'otp_expired' ? (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Si tu enlace de confirmación expiró, puedes solicitar uno nuevo:</p>
            <ResendForm />
          </div>
        ) : null}

        <div className="flex justify-center gap-4">
          <a href="/login" className="text-sky-600 font-medium">Volver a iniciar sesión</a>
          <a href="/register" className="text-sky-600 font-medium">Registrarse</a>
        </div>
      </div>
    </div>
  )
}