import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen">
      <div className="flex-1 relative">
        <header className="absolute mt-0 flex p-10">
          <div className="w-36 h-6 flex items-center gap-4">
            <Image width={16} height={16} src="/img/logo.png" alt="" />
            <h1 className="text-zinc-800 font-bold text-[18px] leading-[23px] tracking-[0px]">VivaMedellín</h1>
          </div>
        </header>
        {children}
      </div>
      <div className="flex-1 relative">
        <Image fill className="object-cover" src="/img/udea.jpg" alt="" />
      </div>
    </div>
  )
}