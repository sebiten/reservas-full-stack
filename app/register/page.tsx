"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerUser } from "./action";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const formSchema = z
  .object({
    email: z.string().email({ message: "Introduce un email válido." }),
  })
  .and(passwordMatchSchema);

export default function Register() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await registerUser({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });

      if (response.error) {
        setServerError(response.message);
      } else {
        router.push("/register/confirmation");
      }
    } catch (error) {
      setServerError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1A1A1A] text-gray-200 relative">
      {/* Fondo degradado */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A] to-[#2C2C2C]"></div>

      {/* Tarjeta */}
      <Card className="relative w-full max-w-md mx-auto shadow-lg rounded-lg bg-[#2C2C2C] p-6 animate-fade-in">
        <CardHeader>
          <img
            src="/logopng.png"
            alt="Barbería Elite Logo"
            className="h-32 w-32 mx-auto object-cover"
          />
          <CardTitle className="text-center text-3xl font-extrabold text-[#D4AF37]">
            ¡Regístrate en Barbería Elite!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-4 w-full"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#1A1A1A] text-gray-300 border-[#444444] focus:ring-[#D4AF37]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="bg-[#1A1A1A] text-gray-300 border-[#444444] focus:ring-[#D4AF37]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="bg-[#1A1A1A] text-gray-300 border-[#444444] focus:ring-[#D4AF37]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 ${
                  isLoading
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-[#D4AF37] text-black hover:bg-[#E2C069] transition-transform hover:scale-105"
                } rounded-lg shadow-md`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrarse"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          <p className="text-gray-400 text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-[#D4AF37] underline">
              Inicia sesión aquí
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
