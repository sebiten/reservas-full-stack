import GoogleSignin from "./login/GoogleSignin";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import barba from "@/app/barba.webp";
import corte from "@/app/corte.webp";
import spa from "@/app/spa.webp";
import { User2Icon } from "lucide-react";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1A1A1A] text-gray-200">
      {/* Fondo con degradado dinámico */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#2C2C2C] "></div>

      {/* Contenido principal */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10">
        <main className="flex flex-col items-center gap-10 w-full max-w-6xl">
          {/* Sección de bienvenida */}
          {!user && (
            <Card className="w-full max-w-md shadow-xl rounded-xl bg-[#2C2C2C] animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-center text-3xl font-extrabold text-[#D4AF37]">
                  ¡Bienvenido a Barbería Elite!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-400">
                <p className="text-lg">
                  Inicia sesión para acceder a los mejores cortes y servicios.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <GoogleSignin />
              </CardFooter>
            </Card>
          )}

          {/* Dashboard de usuario */}
          {user && (
            <div className="flex flex-col text-center items-center gap-8 p-6 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#2C2C2C] shadow-lg animate-fade-in-down">
              {/* Saludo y avatar */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-28 h-28 shadow-md">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"}
                    alt="Avatar del usuario"
                    className="object-cover"
                  />
                  <AvatarFallback>
                    <User2Icon className="w-10 h-10 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-3xl font-bold text-gray-100">
                  ¡Hola, {user.user_metadata.full_name || user.email} 👋!
                </h2>
                <p className="text-gray-400 mt-2 text-lg">
                  ¿Listo para un nuevo corte? Te esperamos con estilo.
                </p>
              </div>

              {/* Acciones principales */}
              <div className="flex justify-center gap-6">
                <Link href="/reserva">
                  <Button className="px-6 py-3 text-black bg-[#D4AF37] rounded-lg shadow-md hover:bg-[#E2C069] transform transition-all duration-300 hover:scale-105">
                    ¡Reserva tu turno!
                  </Button>
                </Link>
                <Link href="/perfil">
                  <Button variant={"ghost"} className="px-6 py-3 bg-inherit text-white rounded-lg shadow-md  transform transition-all duration-300 hover:scale-105">
                    Ver mis turnos
                  </Button>
                </Link>
              </div>

              {/* Promoción */}
              <div className="relative w-10/12 text-center mt-6">
                <div className="absolute inset-0 bg-[url('/bg.webp')] object-center bg-cover  bg-center opacity-10 rounded-lg shadow-md "></div>
                <div className="relative p-6">
                  <p className="text-[#D4AF37] text-lg font-semibold">
                    ¡Reservar es fácil! <span className="font-extrabold">Haz clic en "Reservar turno"</span>, elige el horario y consúltalo en tu perfil. Tras el corte, el barbero lo completará y estará en "Turnos completados".
                  </p>
                </div>
              </div>




              {/* Servicios destacados */}
              <div className="w-full flex flex-wrap justify-center gap-8 mt-10">
                <div className="p-6 rounded-lg bg-[#2C2C2C] shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl">
                  <Image
                    width={300}
                    height={300}
                    src={corte}
                    alt="Corte Clásico"
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-bold text-white">Corte Clásico</h3>
                  <p className="text-gray-400 mt-2">
                    Perfecto para cualquier ocasión.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-[#2C2C2C] shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl">
                  <Image
                    width={300}
                    height={300}
                    src={barba}
                    alt="Barba Premium"
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-bold text-white">Barba Premium</h3>
                  <p className="text-gray-400 mt-2">
                    El estilo que define tu personalidad.
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-[#2C2C2C] shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl">
                  <Image
                    src={spa}
                    width={300}
                    height={300}
                    alt="Spa Capilar"
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-bold text-white">Spa Capilar</h3>
                  <p className="text-gray-400 mt-2">
                    Relájate mientras cuidamos tu cabello.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 bg-[#1A1A1A] text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-gray-400 text-sm">
            © 2024 Barbería Elite. Todos los derechos reservados.
          </p>
          <p className="text-gray-500 text-xs mt-1">Diseñado con estilo y pasión.</p>
        </div>
      </footer>
    </div>
  );
}
