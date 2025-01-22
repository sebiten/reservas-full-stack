import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GoogleSignin from "./GoogleSignin";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const supabase = createClient();
  const { data, error } = await (await supabase).auth.getUser();
  const user = data?.user as { email?: string } | null;

  if (user?.email) {
    redirect("/");
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1A1A1A] text-gray-200 relative">
      {/* Fondo degradado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#1A1A1A]"></div>

      {/* Tarjeta */}
      <Card className="relative w-full max-w-md mx-auto shadow-lg rounded-lg bg-[#2C2C2C] p-6 animate-fade-in">
        <CardHeader>
          <img className="object-cover h-32 w-32 mx-auto" src="/logopng.png" />
          <CardTitle className="text-center text-3xl font-extrabold text-[#D4AF37]">
            ¡Bienvenido a Barbería Elite!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-400">
            {user
              ? `Estás autenticado como ${user.email}.`
              : "Inicia sesión para gestionar tus turnos con estilo."}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          {user ? (
            <p className="text-green-400 text-sm">Redirigiendo...</p>
          ) : (
            <>
              <GoogleSignin />
              <LoginForm />
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
