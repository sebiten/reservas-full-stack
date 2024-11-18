import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "./LogoutButton";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UserIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function page() {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log(userData);

  const userId = userData.user?.id;
  const userEmail = userData.user?.email;
  const { data: bookingsData, error: bookingsError } = await supabase
    .from("reserva")
    .select("*")
    .eq("email", userEmail);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Perfil del Usuario */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src={userData.user?.user_metadata.picture}
                ></AvatarImage>
                <AvatarFallback>
                  <UserIcon className="w-8 h-8" />
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
              <p className="text-gray-500">No tienes turnos reservados aún.</p>
            ) : (
              <div className="space-y-2">
                {bookingsData?.map((bookingsData) => (
                  <div
                    key={bookingsData.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{bookingsData.service}</p>
                      <p className="text-sm text-gray-500">
                        {bookingsData.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {bookingsData.date}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="mr-2 h-4 w-4" /> Ver Detalles
                      </Button>
                      <Button variant="destructive" size="sm">
                        <CalendarIcon className="mr-2 h-4 w-4" /> Cancelar turno
                      </Button>
                    </div>
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
