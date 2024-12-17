import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GoogleSignin from "./GoogleSignin";

export default async function LoginPage() {
  const supabase = createClient();
  const { data: { user }, error } = await (await supabase).auth.getUser();


  // Si el usuario está autenticado, redirigir al inicio
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm mx-auto shadow-lg rounded-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            ¡Bienvenido a nuestra Barbería!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            {user
              ? `Estás autenticado como ${user.user.full_name}.`
              : "Inicia sesión para poder reservar tu turno fácilmente."}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 items-center">
          {user ? (
            <p className="text-center text-sm text-green-600">
              Redirigiendo...
            </p>
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
