"use client";
import React, { useState, useEffect } from "react";
import { Calendar } from "./calendar"; // Componente Calendar de ShadCN
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

// Tipo para los datos de la reserva
export interface Reserva {
  date: Date;
  hour: string;
  name: string;
  phone: string;
  user_id: string;
  service: string | undefined;
}

export default function ReservasOdontologia() {
  const supabase = createClient();
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
      // Obtener el email del usuario autenticado
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error al obtener el usuario:", error);
        alert("No se pudo obtener el email del usuario.");
        return;
      }

      const email = data?.user?.email;
      const user_id = data?.user?.email;
      if (!email) {
        alert("Usuario no autenticado. Por favor, inicia sesión.");
        return;
      }

      // Subir la reserva con los datos y el email del usuario
      const response = await subirReserva({
        date: date!,
        name,
        email,
        phone,
        hour,
        service,
      });

      if (response.success) {
        alert("Reserva creada exitosamente.");
      } else {
        alert(`Error al crear reserva: ${response.message}`);
      }
    } catch (error) {
      console.error("Error al enviar la reserva:", error);
      alert("Hubo un error al procesar la reserva.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Reserva tu turno odontológico
      </h1>
      {/* Contenedor horizontal */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 w-full max-w-4xl">
        {/* Calendario */}
        <div className="w-full lg:w-1/2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border shadow-sm"
          />
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="w-full lg:w-1/2 space-y-6 bg-white p-6 rounded-lg shadow-lg"
        >
          <div>
            <label
              htmlFor="selectedDate"
              className="block text-sm font-medium text-gray-800"
            >
              Fecha seleccionada
            </label>
            <input
              type="text"
              id="selectedDate"
              name="selectedDate"
              value={date ? date.toISOString().split("T")[0] : ""}
              readOnly
              className="mt-2 p-3 border rounded-lg w-full bg-gray-100 text-gray-700"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-800"
            >
              Nombre del paciente
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingrese su nombre completo"
              className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-800"
            >
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 123-456-7890"
              className="mt-2 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="service"
              className="block text-sm font-medium text-gray-800"
            >
              Servicio odontológico
            </label>
            <Select onValueChange={(valor) => setService(valor)}>
              <SelectTrigger className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {serviciosOdontologia.map((servicio: string) => (
                  <SelectItem value={servicio} key={servicio}>
                    {servicio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="hour"
              className="block text-sm font-medium text-gray-800"
            >
              Horario
            </label>
            <Select onValueChange={(valor) => setHour(valor)}>
              <SelectTrigger className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Selecciona un horario" />
              </SelectTrigger>
              <SelectContent>
                {horarios.map((horario: string) => (
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
          <Button type="submit" className="w-full py-3  rounded-lg ">
            Reservar
          </Button>
        </form>
      </div>
    </div>
  );
}
