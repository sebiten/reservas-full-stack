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
import Image from "next/image";
import barba from "@/app/barba.webp"
import corte from "@/app/corte.webp"
import spa from "@/app/spa.webp"
import { AvatarFallback } from "@radix-ui/react-avatar";
import { User2Icon } from "lucide-react";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <div className="relative h-full min-h-screen w-full overflow-hidden bg-gray-50">
      {/* Fondo con degradado elegante y patrón dinámico */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-white animate-gradient-move"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:14px_14px]"></div>

      {/* Contenido principal */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10">
        <main className="flex flex-col items-center gap-10 w-full max-w-4xl">
          {/* Sección de bienvenida */}
          {!user && (
            <Card className="w-full max-w-md shadow-xl rounded-xl bg-white animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-center text-3xl font-extrabold text-gray-800 animate-bounce-slow">
                  ¡Bienvenido a <span className="text-blue-600">Barbería Elite</span>!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                <p className="text-lg">
                  Inicia sesión para acceder a los mejores cortes y servicios exclusivos.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <GoogleSignin />
              </CardFooter>
            </Card>
          )}

          {/* Dashboard de usuario */}
          {user && (
            <div className="flex flex-col text-center sm:text-start items-center gap-8 p-6 rounded-xl bg-white shadow-lg animate-fade-in-down">
              {/* Saludo y avatar */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                <Avatar className="w-24 h-24 mx-auto shadow-md transform transition-transform hover:scale-110">
                  <AvatarImage
                    src={
                      user.user_metadata.avatar_url || user.user_metadata.picture
                    }
                    alt="Avatar del usuario"
                    className="object-cover"
                  />
                  <AvatarFallback>
                    <User2Icon className="w-24 h-24 text-gray-500" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
                    ¡Hola, {user.user_metadata.full_name || user.email} 👋!
                  </h2>
                  <p className="text-gray-600 mt-2 text-lg">
                    ¿Listo para un nuevo corte? Te esperamos con estilo.
                  </p>
                </div>
              </div>

              {/* Acciones principales */}
              <div className="flex justify-center gap-4">
                <Link href="/reserva">
                  <Button className="px-6 py-3 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transform transition-all duration-300 hover:scale-105">
                    ¡Reserva tu turno!
                  </Button>
                </Link>
                <Link href="/perfil">
                  <Button className="px-6 py-3 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 transform transition-all duration-300 hover:scale-105">
                    Ver mis turnos
                  </Button>
                </Link>
              </div>

              {/* Promoción */}
              <div className="w-full text-center bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 p-6 rounded-lg shadow-md mt-6 animate-pulse">
                <p className="text-blue-800 text-lg font-semibold">
                  ¡Obtén un <span className="font-extrabold">20% de descuento</span> en tu primer corte si reservas esta semana!
                </p>
              </div>



              {/* Servicios destacados */}
              <div className="w-full flex flex-wrap justify-center gap-8 mt-10">
                <div className="p-6 rounded-lg bg-white shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl">
                  <Image
                    width={300}
                    height={300}
                    src={corte}
                    alt="Corte Clásico"
                    className="w-full h-40 object-cover rounded-lg mb-4 animate-slide-in"
                  />
                  <h3 className="text-lg font-bold text-gray-800">Corte Clásico</h3>
                  <p className="text-gray-600 mt-2">Perfecto para cualquier ocasión.</p>
                </div>
                <div className="p-6 rounded-lg bg-white shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl">
                  <Image
                    width={300}
                    height={300}
                    src={barba}
                    alt="Barba Premium"
                    className="w-full h-40 object-cover rounded-lg mb-4 animate-slide-in"
                  />
                  <h3 className="text-lg font-bold text-gray-800">Barba Premium</h3>
                  <p className="text-gray-600 mt-2">El estilo que define tu personalidad.</p>
                </div>
                <div className="p-6 rounded-lg bg-white shadow-lg transform transition-transform hover:scale-105 hover:shadow-xl">
                  <Image
                    src={spa}
                    width={300}
                    height={300}
                    alt="Spa Capilar"
                    className="w-full h-40 object-cover rounded-lg mb-4 animate-slide-in"
                  />
                  <h3 className="text-lg font-bold text-gray-800">Spa Capilar</h3>
                  <p className="text-gray-600 mt-2">Relájate mientras cuidamos tu cabello.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 bg-gray-800 text-gray-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg">© 2024 Barbería Elite. Todos los derechos reservados.</p>
          <p className="text-sm mt-2">Diseñado con amor y estilo.</p>
        </div>
      </footer>
    </div>
  );
}
