import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "./LogoutButton";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserIcon } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";

export default async function Dashboard() {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(`public/${userId}/avatar.jpg`);

  const { data: bookings, error: bookingsError } = await supabase
    .from("reserva")
    .select("*")
    .eq("email", userData?.user?.email);

  if (bookingsError) {
    console.error("Error al obtener las reservas:", bookingsError.message);
    return (
      <p className="text-red-500">Hubo un error al cargar las reservas.</p>
    );
  }
  if (userError || !userData?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Perfil del Usuario */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src={data.publicUrl}
                  alt="Avatar del usuario"
                  className="object-cover"
                />
                <AvatarFallback>
                  <UserIcon className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl font-bold">
                  {userData.user.email}
                </CardTitle>
                <Badge variant="outline">Cliente Regular</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              ¡Bienvenido de nuevo! Aquí puedes ver tus turnos reservados y
              gestionar tu perfil.
            </p>
            <ProfileForm userId={userId} />
          </CardContent>
        </Card>
        {/* Sección de Turnos Reservados */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Turnos Reservados</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsError && (
              <p className="text-red-500">Error al cargar los turnos.</p>
            )}
            {bookings?.length === 0 ? (
              <p className="text-gray-500">No tienes turnos reservados aún.</p>
            ) : (
              <div className="space-y-2">
                {bookings?.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{booking.service}</p>
                      <p className="text-sm text-gray-500">{booking.name}</p>
                      <p className="text-sm text-gray-500">{booking.date}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="mr-2 h-4 w-4" /> Ver Detalles
                    </Button>
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
  );
}
