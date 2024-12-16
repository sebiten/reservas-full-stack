import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "./LogoutButton";
import { Button } from "@/components/ui/button";
import { CalendarIcon, User, User2, User2Icon, UserIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { CancelarReserva, ObtenerImagenPerfil } from "./action";

export default async function page() {

  const supabase = createClient();
  const { success, image, error } = await ObtenerImagenPerfil();
  const {
    data: { user },
  } = await (await supabase).auth.getUser()
  const userEmail = user?.email;
  const { data: bookingsData, error: bookingsError } = await (await supabase).from("reservas")
    .select("*")
    .eq("email", userEmail);

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError.message);
  } else {
    console.log("Bookings data:", bookingsData);
  }


  return (
    <div className="relative h-full w-full bg-white">
      {/* Fondo dinámico con degradados */}
      <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Contenido principal */}
      <div className="relative container mx-auto p-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Perfil del Usuario */}
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={
                      image
                    }
                    alt="Avatar del usuario"
                    className="object-cover"
                  />
                  <AvatarFallback>
                    <User2Icon className="w-full h-full" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-bold">{userEmail}</CardTitle>
                  <Badge variant="outline">Cliente Regular</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                ¡Bienvenido de nuevo! Aquí puedes ver tus turnos reservados y
                gestionar tu perfil.
              </p>
            </CardContent>
          </Card>

          {/* Sección de Turnos Reservados */}
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Turnos Reservados</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsData?.length === 0 ? (
                <>
                  <p className="text-gray-500">No tienes turnos reservados aún.</p>
                  <Button className="px-6 py-3 my-4 text-white bg-black rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    <Link href="/reserva">¡Reserva tu turno ahora!</Link>
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  {bookingsData?.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{booking.service}</p>
                        <p className="text-sm text-gray-500">{booking.name}</p>
                        <p className="text-sm text-gray-500">{booking.date}</p>
                      </div>
                      <form action={CancelarReserva} className="flex flex-col">
                        <input type="hidden" name="id" value={booking.id} />
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="mr-2 h-4 w-4" /> Ver Detalles
                        </Button>
                        <Button type="submit" variant="destructive" size="sm">
                          <CalendarIcon className="mr-2 h-4 w-4" /> Cancelar turno
                        </Button>
                      </form>
                    </div>
                  ))}

                </div>
              )}
            </CardContent>
          </Card>

          {/* Botón de Cerrar Sesión */}
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
