import Link from "next/link";

export default function Home() {
  return (<>
    <h1 className="text-6xl">Dashboard en Desarrollo</h1>
    <Link href="/auth/register">Registrarse</Link>
  </>);
}
