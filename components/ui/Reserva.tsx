"use client";
import React, { useState, useEffect } from "react";
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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export interface Reserva {
  date: Date;
  name: string;
  email: string;
  phone: string;
  hour: string;
  service: string;
  servicecount: number;
}

export default function Reserva() {
  const supabase = createClient();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hour, setHour] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [servicecount, setServicecount] = useState<number>(0);
  const [disabledHours, setDisabledHours] = useState<string[]>([]);

  // Estado de carga
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true); // Iniciamos la carga
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.email) {
        toast({
          title: "Error de autenticación",
          description: "Debes estar autenticado para reservar.",
          variant: "destructive",
        });
        return;
      }

      const email = data.user.email;
      console.log("email desde cliente handlesubmit", email);

      const reservaData: Reserva = {
        date: date!,
        name,
        email,
        phone,
        hour,
        service,
        servicecount,
      };

      const response = await subirReserva(reservaData);

      if (response.success) {
        toast({
          title: "Reserva creada exitosamente 🎉",
          description: `Tu turno está reservado para ${date?.toLocaleDateString()} a las ${hour}.`,
          variant: "default",
        });

        // Enviar el correo
        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name,
            date: date?.toISOString(),
            hour,
            phone,
            service,
            servicecount,
          }),

        });

        if (emailResponse.ok) {
          toast({
            title: "Correo enviado ✉️",
            description: "Se envió la confirmación de la reserva a tu correo.✅",
            variant: "default",
          });
        } else {
          const errorData = await emailResponse.json();
          toast({
            title: "Error al enviar el correo",
            description: errorData.error || "Algo salió mal al enviar el correo.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error al crear la reserva",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al procesar la reserva:", error);
      toast({
        title: "Error inesperado",
        description: "No se pudo procesar tu reserva. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      // Finalizamos la carga, en el bloque finally para que ocurra pase lo que pase
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const reservas: Reserva[] = await obtenerReservas();
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

  return (
    <div className="flex flex-col items-center w-full h-screen justify-center  px-4 sm:px-6 lg:px-8 bg-[#1A1A1A] text-gray-200">

      <img className="object-cover h-60 w-60" src="/logopng.png" />


      <div className="flex flex-col lg:flex-row items-start justify-center gap-2 w-full max-w-5xl animate-slide-up">
        {/* Calendario */}
        <div className="mx-auto  bg-[#2C2C2C] p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
          <h1 className="text-3xl font-extrabold text-[#D4AF37] mb-6 text-center animate-fade-in">
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
          onSubmit={handleSubmit}
          className="w-full lg:w-1/2 space-y-6 bg-[#2C2C2C] p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Fecha seleccionada
            </label>
            <input
              type="text"
              value={date ? date.toISOString().split("T")[0] : ""}
              readOnly
              className="mt-2 p-3 border border-[#444444] rounded-lg w-full bg-[#1A1A1A] text-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Nombre del paciente
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              className="mt-2 p-3 border border-[#444444] rounded-lg w-full bg-[#1A1A1A] text-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 123-456-7890"
              className="mt-2 p-3 border border-[#444444] rounded-lg w-full bg-[#1A1A1A] text-gray-300 focus:ring-2 focus:ring-[#D4AF37]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Servicio odontológico
            </label>
            <Select onValueChange={setService}>
              <SelectTrigger className="mt-2 w-full p-3 border border-[#444444] rounded-lg bg-[#1A1A1A] text-gray-300 focus:ring-2 focus:ring-[#D4AF37]">
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Horario
            </label>
            <Select onValueChange={setHour}>
              <SelectTrigger className="mt-2 w-full p-3 border border-[#444444] rounded-lg bg-[#1A1A1A] text-gray-300 focus:ring-2 focus:ring-[#D4AF37]">
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
          </div>

          {/* Botón de reservar con estado de carga */}
          <Button
            type="submit"
            className="w-full py-3 bg-[#D4AF37] text-black rounded-lg shadow-md hover:bg-[#E2C069] transition-all duration-200 transform hover:scale-105"
            disabled={isLoading} // Deshabilitamos mientras está cargando
          >
            {isLoading ? "Enviando Reserva..." : "Reservar"}
          </Button>

          {/* Botón de ver turnos */}
          <Link href="/perfil">
            <Button
              type="button"
              variant="outline"
              className="w-full py-3 mt-2 rounded-lg bg-inherit border border-[#444444] text-gray-300 hover:bg-[#444444] hover:text-[#D4AF37] transition-all"
            >
              Ver mis turnos
            </Button>
          </Link>
        </form>
      </div>
    </div>
  );
}
