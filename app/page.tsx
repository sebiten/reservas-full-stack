import Image from "next/image";
import GoogleSignin from "./login/GoogleSignin";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {!user && (
          <Card className="max-w-sm mx-auto my-8 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold">
                ¡Bienvenido a nuestra Barbería!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Inicia sesión para poder reservar tu turno fácilmente.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <GoogleSignin />
            </CardFooter>
          </Card>
        )}
        {user && (
          <div className="flex flex-col items-center gap-6 text-center sm:text-left">
            <Image
              width={100}
              height={100}
              className="rounded-full"
              quality={100}
              unoptimized={true}
              alt="Google-avatar"
              src={
                user?.user_metadata.picture || user?.user_metadata?.avatar_url
              }
            />
            <h2 className="text-2xl font-semibold">
              Bienvenido, {user.email} 👋
            </h2>
            <p className="text-lg">
              ¿Estás listo para reservar tu próximo turno con{" "}
              <span className="font-bold">Barbería Elite</span>? Ofrecemos los
              mejores servicios para que te veas genial.
            </p>
            <button className="px-6 py-3 text-white bg-black rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <Link href="/reserva">¡Reserva tu turno ahora!</Link>
            </button>
            <p className="text-sm text-gray-500">
              ¿Primera vez aquí? Disfruta de un descuento del 10% en tu primer
              corte.
            </p>
          </div>
        )}
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
