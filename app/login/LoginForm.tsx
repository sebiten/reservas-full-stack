"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { loginUser } from "./action";

const formSchema = z.object({
  email: z.string().email({ message: "Introduce un email válido." }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await loginUser(data);
      if (response.error) {
        setServerError(response.message);
      } else {
        router.push("/");
      }
    } catch {
      setServerError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              Cargando...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
      </form>
    </Form>
  );
}
