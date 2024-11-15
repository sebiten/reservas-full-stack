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

// Tipo para los datos de la reserva
export interface Reserva {
  date: Date;
  hour: string;
  name: string;
  phone: string;
  service: string;
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
    <div className="flex flex-col items-center justify-center">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
      <form onSubmit={handleSubmit} className="mt-4 space-y-4 w-full max-w-md">
        <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700">
          Fecha seleccionada:
        </label>
        <input
          type="text"
          id="selectedDate"
          name="selectedDate"
          value={date ? date.toISOString().split("T")[0] : ""}
          readOnly
          className="mt-1 p-2 border rounded-md w-full"
        />
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre del paciente:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Teléfono:
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700">
            Servicio odontológico:
          </label>
          <Select onValueChange={(valor) => setService(valor)}>
            <SelectTrigger className="w-full">
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
        <Select onValueChange={(valor) => setHour(valor)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un horario" />
          </SelectTrigger>
          <SelectContent>
            {horarios.map((horario: any) => (
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
        <button type="submit" className="mt-4 p-2 bg-blue-500 text-white rounded-md">
          Reservar
        </button>
      </form>
    </div>
  );
}
