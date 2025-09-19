import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}
      >
        <header className="flex p-10">
          <div className="w-[147px] h-[23px] flex items-center gap-4">
            <img className="h-4 w-4" src=" /img/logo.png" alt="" />
            <h1 className="font-inter text-zinc-800 font-bold text-[18px] leading-[23px] tracking-[0px]">VivaMedellín</h1>
          </div>
        </header>
        <div className="">{children}</div>

      </body>
    </html>
  );
}
