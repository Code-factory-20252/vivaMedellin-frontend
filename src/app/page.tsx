import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  return (
    <>
      <div className="w-screen h-screen relative flex flex-col justify-around items-center">
        <Image fill className="-z-10 absolute opacity-30" src="/img/udea.jpg" alt="" />
        <div className="flex items-center gap-4 top-44">
          <Image width={50} height={50} src="/img/logo.png" alt="" />
          <h1 className="text-zinc-800 font-bold text-[64px] leading-[23px] tracking-[0px]">
            VivaMedellín
          </h1>
        </div>
        <h1 className="text-6xl font-bold text-slate-700">Dashboard en Desarrollo</h1>
        <div className="flex gap-10 bg-accent w-fit h-fit py-5 px-10 rounded-md">
          <Link className="leading-2 font-semibold text-sky-500" href="/register">
            Registrarse
          </Link>
          <Link className="leading-2 font-semibold text-sky-500" href="/login">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </>
  );
}
