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
  } = await (await supabase).auth.getUser();

  return (
    <div className="relative h-full min-h-screen w-full overflow-hidden bg-gray-50">
      {/* Fondo con degradado sutil y patrón */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:14px_14px]"></div>

      {/* Contenido principal */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10">
        <main className="flex flex-col items-center gap-10 w-full max-w-3xl">
          {/* Si el usuario no ha iniciado sesión */}
          {!user && (
            <Card className="w-full max-w-md shadow-xl rounded-xl bg-white animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-gray-800">
                  ¡Bienvenido a <span className="text-blue-600">Barbería Elite</span>!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                <p className="text-base">
                  Inicia sesión para acceder a los mejores cortes y servicios exclusivos.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <GoogleSignin />
              </CardFooter>
            </Card>
          )}

          {/* Si el usuario ha iniciado sesión */}
          {user && (
            <div className="flex flex-col items-center gap-8 p-6 rounded-xl bg-white shadow-lg animate-fade-in-down">
              {/* Avatar y saludo */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                <Avatar className="w-20 h-20 shadow-md">
                  <AvatarImage
                    src={
                      user.user_metadata.avatar_url || user.user_metadata.picture
                    }
                    alt="Avatar del usuario"
                    className="object-cover"
                  />
                </Avatar>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    ¡Hola, {user.user_metadata.full_name || user.email} 👋!
                  </h2>
                  <p className="text-gray-600 mt-1">
                    ¿Listo para un nuevo corte? Te esperamos.
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap justify-center gap-4">
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

              {/* Nota promocional */}
              <p className="text-sm text-gray-500 mt-4">
                ¿Primera vez aquí? Obtén un <span className="font-bold">10% de descuento</span> en tu primer corte.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
