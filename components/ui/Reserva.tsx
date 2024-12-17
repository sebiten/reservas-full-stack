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

// Tipo para los datos de la reserva
export interface Reserva {
  date: Date;
  hour: string;
  name: string;
  phone: string;
  service: string | undefined;
}

export default function ReservasOdontologia() {
  const supabase = createClient();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hour, setHour] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [disabledHours, setDisabledHours] = useState<string[]>([]);

  // Obtener reservas para deshabilitar fechas y horarios
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error al obtener el usuario:", error);
        toast({
          title: "Error de autenticación",
          description: "Debes estar autenticado para reservar.",
          variant: "destructive",
        });
        return;
      }

      const email = data?.user?.email;
      if (!email) {
        toast({
          title: "Usuario no autenticado",
          description: "Por favor, inicia sesión para continuar.",
          variant: "destructive",
        });
        return;
      }

      const response = await subirReserva({
        date: date!,
        name,
        email,
        phone,
        hour,
        service,
      });

      if (response.success) {
        toast({
          title: "Reserva creada exitosamente 🎉",
          description: `Tu turno está reservado para ${date?.toLocaleDateString()} a las ${hour}.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Error al crear la reserva",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al enviar la reserva:", error);
      toast({
        title: "Error inesperado",
        description: "No se pudo procesar tu reserva. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center w-full justify-center py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center animate-fade-in">
        Reserva tu turno odontológico 🦷
      </h1>

      {/* Contenedor principal */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-5xl animate-slide-up">
        {/* Calendario con sombra y animación */}
        <div className="mx-auto bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border shadow-sm"
          />
        </div>

        {/* Formulario estilizado */}
        <form
          onSubmit={handleSubmit}
          className="w-full lg:w-1/2 space-y-6 bg-white p-8 rounded-lg shadow-lg transition-all hover:shadow-2xl duration-300 ease-in-out"
        >
          {/* Fecha seleccionada */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha seleccionada
            </label>
            <input
              type="text"
              value={date ? date.toISOString().split("T")[0] : ""}
              readOnly
              className="mt-2 p-3 border rounded-lg w-full bg-gray-100 text-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del paciente
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 123-456-7890"
              className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Servicio odontológico
            </label>
            <Select onValueChange={setService}>
              <SelectTrigger className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
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

          {/* Horario */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Horario
            </label>
            <Select onValueChange={setHour}>
              <SelectTrigger className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
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

          {/* Botón de enviar */}
          <Button type="submit" className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200">
            Reservar
          </Button>

          {/* Botón para ver turnos */}
          <Link href="/perfil">
            <Button
              type="button"
              variant="outline"
              className="w-full py-3 rounded-lg hover:bg-gray-100"
            >
              Ver mis turnos
            </Button>
          </Link>
        </form>
      </div>
    </div>
  );
}
