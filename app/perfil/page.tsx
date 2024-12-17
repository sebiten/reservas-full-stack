import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "./LogoutButton";
import { Button } from "@/components/ui/button";
import { CalendarIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { CancelarReserva } from "./action";

export default async function page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();
  const userEmail = user?.email;
  const { data: bookingsData, error: bookingsError } = await (await supabase)
    .from("reservas")
    .select("*")
    .eq("email", userEmail);

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError.message);
  } else {
    console.log("Bookings data:", bookingsData);
  }

  return (
    <div className="relative h-full min-h-screen w-full overflow-hidden bg-gray-50">
      {/* Fondo con degradado sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:14px_14px]"></div>

      {/* Contenido principal */}
      <div className="relative container mx-auto p-6 flex flex-col items-center gap-8">
        {/* Perfil del Usuario */}
        <Card className="w-full max-w-lg shadow-xl rounded-xl bg-white animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 shadow">
                <AvatarFallback>
                  <User2Icon className="w-full h-full text-gray-500" />
                </AvatarFallback>
                <AvatarImage
                  src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                  alt="Avatar del usuario"
                  className="object-cover"
                />
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {user?.user_metadata.full_name || userEmail}
                </CardTitle>
                <Badge variant="outline" className="text-sm mt-1">
                  Cliente Regular
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-gray-600">
            <p className="text-base">
              ¡Bienvenido de nuevo! Aquí puedes ver tus turnos reservados y gestionar tu perfil.
            </p>
          </CardContent>
        </Card>

        {/* Sección de Turnos Reservados */}
        <Card className="w-full max-w-lg shadow-lg rounded-xl bg-white animate-fade-in-down">
          <CardHeader>
            <CardTitle className="text-gray-800 text-xl font-semibold">
              Turnos Reservados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsData?.length === 0 ? (
              <div className="text-center text-gray-500">
                <p>No tienes turnos reservados aún.</p>
                <Button className="mt-6 px-6 py-3 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transform transition-all hover:scale-105">
                  <Link href="/reserva">¡Reserva tu turno ahora!</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingsData?.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex justify-between items-center border-b pb-3 last:border-none"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{booking.service}</p>
                      <p className="text-sm text-gray-500">{booking.name}</p>
                      <p className="text-sm text-gray-500">{booking.date}</p>
                    </div>
                    <form action={CancelarReserva} className="flex flex-col gap-2">
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
        <div className="w-full max-w-lg text-center animate-fade-in-up">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
