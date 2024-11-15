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

import { horarios } from "@/lib/constantes";
import { obtenerReservas, subirReserva } from "@/app/perfil/action";

// Tipo para los datos de la reserva
export interface Reserva {
  date: Date;
  hour: string;
  name: string;
  email: string;
  phone: string;
}

export default function Reservas() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hour, setHour] = useState<string>("");
  // const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [disabledHours, setDisabledHours] = useState<string[]>([]);

  // Obtener reservas para deshabilitar fechas y horarios
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const reservas: Reserva[] = await obtenerReservas();
        if (!reservas || reservas.length === 0) return;

        // Deshabilitar horarios de la fecha seleccionada
        if (date) {
          const horariosReservados = reservas
            .filter((reserva) => {
              const reservaDate = new Date(reserva.date);
              // Comparar solo la fecha sin la hora
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
    const response = await subirReserva({
      date: date!,
      name,
      email,
      phone,
      hour,
    });
    if (response.success) {
      alert("Reserva creada exitosamente.");
    } else {
      alert(`Error al crear reserva: ${response.message}`);
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
        <label
          htmlFor="selectedDate"
          className="block text-sm font-medium text-gray-700"
        >
          Fecha seleccionada:
        </label>
        <input
          type="text"
          id="selectedDate"
          name="selectedDate"
          value={date ? date.toISOString().split("T")[0] : ""} // Formato 'YYYY-MM-DD'
          readOnly
          className="mt-1 p-2 border rounded-md w-full"
        />
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre:
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
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email / Obra social:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 p-2 border rounded-md w-full"
            required
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
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
        <Select onValueChange={(valor) => setHour(valor)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Horarios" />
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
        <button
          type="submit"
          className="mt-4 p-2 bg-blue-500 text-white rounded-md"
        >
          Reservar
        </button>
      </form>
    </div>
  );
}
