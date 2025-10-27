import { Inter } from "next/font/google";
import "./globals.css";
import AlertProvider from '@/components/ui/Toast'

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
  <AlertProvider>{children}</AlertProvider>
      </body>
    </html>
  );
}
