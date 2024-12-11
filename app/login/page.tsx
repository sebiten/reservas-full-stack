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
  const { data } = await (await supabase).auth.getUser();
  const email = data.user?.email;
  if (data.user) {
    redirect("/");
  }

  return (
    <>
      {!data ? (
        <Card className="max-w-sm mx-auto my-8 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold">
              ¡Bienvenido a nuestra Barbería!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">{email}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <GoogleSignin />
          </CardFooter>
        </Card>
      ) : (
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
            <LoginForm />
          </CardFooter>
        </Card>
      )}
    </>
  );
}
