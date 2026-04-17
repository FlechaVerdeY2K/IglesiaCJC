import Link from "next/link";
import Image from "next/image";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function AuthWelcomePage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = params?.next && params.next.startsWith("/") ? params.next : "/perfil";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card text-center">
          <Image
            src="/logo-cjc.png"
            alt="Logo CJC"
            width={64}
            height={64}
            className="object-contain mx-auto mb-4"
          />
          <p className="text-accent text-[10px] font-black tracking-[3px] uppercase mb-2">
            Cuenta verificada
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h1>
          <p className="text-muted mb-6">
            Tu correo fue confirmado correctamente. Ya puedes continuar a tu perfil.
          </p>

          <Link href={nextPath} className="btn-primary w-full inline-block">
            Continuar
          </Link>
        </div>
      </div>
    </div>
  );
}
