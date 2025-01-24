"use client";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "./calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { horarios, serviciosOdontologia } from "@/lib/constantes";
import { obtenerReservas, subirReserva } from "@/app/perfil/action";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation'
// Esquema de validación con zod
export interface Reserva {
  date: Date;
  name: string;
  email: string;
  phone: string;
  hour: string;
  service: string;
}
const mailFormSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  name: z
    .string()
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios."),
  phone: z
    .string()
    .regex(/^\d{9,}$/, "El número de teléfono debe tener al menos 9 dígitos y solo números."),
  service: z.string().min(1, "Seleccionar un servicio es obligatorio"),
  hour: z.string().min(1, "Seleccionar un horario es obligatorio"),
});

// Tipos generados a partir del esquema de validación
type MailFormInputs = z.infer<typeof mailFormSchema>;

export default function Reserva() {
  const supabase = createClient();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [disabledHours, setDisabledHours] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  // Hook del formulario
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MailFormInputs>({
    resolver: zodResolver(mailFormSchema),
    defaultValues: {
      date: date ? date.toISOString().split("T")[0] : "",
      name: "",
      phone: "",
      service: "",
      hour: "",
    },
  });

  // Actualizar la fecha en el formulario
  useEffect(() => {
    setValue("date", date ? date.toISOString().split("T")[0] : "");
  }, [date, setValue]);

  // Obtener horarios deshabilitados
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const reservas = await obtenerReservas();
        if (!reservas || reservas.length === 0) return;

        if (date) {
          const horariosReservados = reservas
            .filter((reserva) => {
              const reservaDate = new Date(reserva.date);
              return (
                reservaDate.toISOString().split("T")[0] ===
                date.toISOString().split("T")[0]
              );
            })
            .map((reserva) => reserva.hour);
          setDisabledHours(horariosReservados);
        }
      } catch (error) {
        console.error("Error al obtener las reservas:", error);
      }
    };

    fetchReservas();
  }, [date]);

  // Función para manejar el envío del formulario
  const onSubmit: SubmitHandler<MailFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      // Obtener el usuario autenticado
      const { data: user, error } = await supabase.auth.getUser();
      if (error || !user?.user?.email) {
        toast({
          title: "Error de autenticación",
          description: "Debes estar autenticado para realizar una reserva.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Convertir `data.date` en un objeto Date y asignar el correo del usuario`
      const reservaData = {
        date: new Date(data.date), // Convertimos `string` a `Date`
        name: data.name,
        email: user.user.email, // Correo del usuario autenticado
        phone: data.phone,
        hour: data.hour,
        service: data.service,
      };

      // Subir la reserva a la base de datos desde el server action
      const response = await subirReserva(reservaData);
      if (response.success) {
        // Notificar al usuario sobre el éxito
        toast({
          title: "Reserva creada exitosamente 🎉",
          description: `Tu turno está reservado para ${data.date} a las ${data.hour}.`,
          variant: "default",
        });

        // Intentar enviar el correo de confirmación
        try {
          const emailResponse = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.user.email,
              name: data.name,
              date: data.date,
              hour: data.hour,
              phone: data.phone,
              service: data.service,
            }),
          });

          if (emailResponse.ok) {
            toast({
              title: "Correo enviado ✉️",
              description: "Se envió la confirmación de la reserva a tu correo.✅",
              variant: "default",
            });
            router.push("/perfil")
          } else {
            const errorData = await emailResponse.json();
            toast({
              title: "Error al enviar el correo",
              description: errorData.error || "No se pudo enviar el correo.",
              variant: "destructive",
            });
          }
        } catch (emailError) {
          console.error("Error al enviar el correo:", emailError);
          toast({
            title: "Error inesperado",
            description: "No se pudo enviar el correo de confirmación.",
            variant: "destructive",
          });
        }
      } else {
        // Notificar al usuario sobre un error al crear la reserva
        toast({
          title: "Error al crear la reserva",
          description: response.message || "No se pudo procesar tu reserva.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al procesar la reserva:", error);
      toast({
        title: "Error inesperado",
        description: "Hubo un problema al procesar tu reserva. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Finalizamos la carga
    }
  };


  return (
    <div className="flex flex-col items-center w-full h-full justify-center px-4 sm:px-6 lg:px-8 bg-[#1A1A1A] text-gray-200">
      <img className="object-cover h-60 w-60" src="/logopng.png" />

      <div className="flex flex-col lg:flex-row items-start justify-center gap-2 w-full max-w-5xl">
        {/* Calendario */}
        <div className="mx-auto bg-[#2C2C2C] p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-extrabold text-[#D4AF37] mb-6 text-center">
            Reserva tu turno ahora
          </h1>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border border-[#444444] shadow-sm text-white w-fit mx-auto"
          />
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full lg:w-1/2 space-y-6 bg-[#2C2C2C] p-8 rounded-lg shadow-lg"
        >
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Fecha seleccionada
            </label>
            <input
              type="text"
              readOnly
              {...register("date")}
              className="mt-2 p-3 border border-[#444444] rounded-lg w-full bg-[#1A1A1A] text-gray-300"
            />
            {errors.date && (
              <p className="text-red-500 text-sm">{errors.date.message}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Nombre del paciente
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Tu nombre completo"
              className="mt-2 p-3 border border-[#444444] rounded-lg w-full bg-[#1A1A1A] text-gray-300"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Teléfono
            </label>
            <input
              type="tel"
              {...register("phone")}
              placeholder="Ej: 123-456-7890"
              className="mt-2 p-3 border border-[#444444] rounded-lg w-full bg-[#1A1A1A] text-gray-300"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Servicio odontológico */}
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Servicio odontológico
            </label>
            <Select onValueChange={(value) => setValue("service", value)}>
              <SelectTrigger className="mt-2 w-full p-3 border border-[#444444] rounded-lg bg-[#1A1A1A]">
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {serviciosOdontologia.map((servicio) => (
                  <SelectItem value={servicio} key={servicio}>
                    {servicio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service && (
              <p className="text-red-500 text-sm">{errors.service.message}</p>
            )}
          </div>

          {/* Horario */}
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Horario
            </label>
            <Select onValueChange={(value) => setValue("hour", value)}>
              <SelectTrigger className="mt-2 w-full p-3 border border-[#444444] rounded-lg bg-[#1A1A1A]">
                <SelectValue placeholder="Selecciona un horario" />
              </SelectTrigger>
              <SelectContent>
                {horarios.map((horario) => (
                  <SelectItem
                    value={horario}
                    key={horario}
                    disabled={disabledHours.includes(horario)}
                  >
                    {horario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.hour && (
              <p className="text-red-500 text-sm">{errors.hour.message}</p>
            )}
          </div>

          {/* Botón de enviar */}
          <Button
            type="submit"
            className="w-full py-3 bg-[#D4AF37] text-black rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Enviando Reserva..." : "Reservar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
