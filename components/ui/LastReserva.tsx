import React from "react";
import { createClient } from "@/utils/supabase/server";
import Reserva from "@/components/ui/Reserva";

// type Reserva = {
//   id: number;
//   name: string;
//   hour: string;
//   email: string;
//   phone: string;
// };

export default async function LastReserva() {
  const supabase = await createClient();

  try {
    const { data: reservas, error } = await supabase
      .from("reserva")
      .select("*");

    if (error) {
      console.error("Error al obtener las reservas:", error.message);
      return (
        <p className="text-red-500">Hubo un error al cargar las reservas.</p>
      );
    }
    if (!reservas || reservas.length === 0) {
      return <p className="text-gray-500">No hay reservas disponibles.</p>;
    }

    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Última Reserva</h2>
        <ul className="space-y-3">
          {reservas.map((reserva) => (
            <li key={reserva.id} className="border-b pb-2">
              <p>
                <strong>Nombre:</strong> {reserva.name}
              </p>
              <p>
                <strong>Horario:</strong> {reserva.hour}
              </p>
              <p>
                <strong>Servicio:</strong> {reserva.date}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  } catch (error) {
    console.error("Error inesperado:", error);
    return <p className="text-red-500">Ocurrió un error inesperado.</p>;
  }
}
