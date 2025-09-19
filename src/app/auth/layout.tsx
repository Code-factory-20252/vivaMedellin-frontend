import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen">
      <div className="flex-1">
        <header className="flex p-10">
          <div className="w-[147px] h-[23px] flex items-center gap-4">
            <img className="h-4 w-4" src=" /img/logo.png" alt="" />
            <h1 className="text-zinc-800 font-bold text-[18px] leading-[23px] tracking-[0px]">VivaMedellín</h1>
          </div>
        </header>
        {children}
      </div>
      <div className="flex-1">
        <img className="h-full w-full object-cover " src="/img/udea.jpg" alt="" />
      </div>
    </div>
  )
}