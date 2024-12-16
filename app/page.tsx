import Image from "next/image";
import GoogleSignin from "./login/GoogleSignin";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  console.log(user?.user_metadata.avatar_url);


  return (
    <div className="relative h-full w-full bg-white">
      {/* Fondo dinámico con degradados */}
      <div className="sm:absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      <div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
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
              <div className="flex items-center justify-center gap-2" >
                <Avatar>
                  <AvatarImage
                    src={
                      user.user_metadata.avatar_url || user.user_metadata.picture
                    }
                    alt="Avatar del usuario"
                    className="object-cover w-56"
                  />
                  {/* <AvatarFallback>
                  <User2 className="w-full h-full" />
                </AvatarFallback> */}
                </Avatar>
                <h2 className="text-2xl font-semibold">
                  Bienvenido, {user.email} 👋
                </h2>
              </div>

              <p className="text-lg">
                ¿Estás listo para reservar tu próximo turno con{" "}
                <span className="font-bold">Barbería Elite</span>? Ofrecemos los
                mejores servicios para que te veas genial.
              </p>
              <div className="flex gap-4">
                <Button className="px-6 py-3 text-white bg-black rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  <Link href="/reserva">¡Reserva tu turno ahora!</Link>
                </Button>
                <Button className="px-6 py-3 text-white bg-black rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  <Link href="/perfil">¡Quiero ver mis turnos!</Link>
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                ¿Primera vez aquí? Disfruta de un descuento del 10% en tu primer
                corte.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
