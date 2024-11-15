"use server";

import { redirect } from "next/navigation";
import { Reserva } from "@/components/ui/Reserva";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";


export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function subirReserva({
    date,
    name,
    email,
    phone,
    hour,
  }: {
    date: Date;
    name: string;
    email: string;
    phone: string;
    hour: any;
  }) {
    try {
      // Crear el cliente de Supabase
      const supabase = await createClient();

      // Convertir la fecha a formato 'YYYY-MM-DD'
      const formattedDate = date.toISOString().split("T")[0];

      // Verificar si ya existe una reserva para la misma fecha
      const { data: existingReservation, error: errorFetch } = await supabase
        .from("reserva")
        .select("*")
        .eq("date", formattedDate)
        .eq("hour", hour)
        .limit(1);

      if (errorFetch) {
        throw new Error(
          `Error al verificar reserva existente: ${errorFetch.message}`
        );
      }

      // Si ya existe una reserva, devolver error
      if (existingReservation && existingReservation.length > 0) {
        return {
          success: false,
          message: "Ya existe una reserva para esta fecha.",
        };
      }

      // Insertar la nueva reserva
      const { data, error } = await supabase
        .from("reserva")
        .insert([
          {
            date: formattedDate,
            name,
            email,
            phone,
            hour: String(hour),
          },
        ])
        .select();
      // recarga la pagina
      revalidatePath("/");
      if (error) {
        throw new Error(`Error al insertar reserva: ${error.message}`);
      }

      return { success: true, data };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
  export async function obtenerReservas(): Promise<Reserva[]> {
    try {
      const supabase = await createClient();

      // Obtener todas las reservas de la base de datos
      const { data: reservas, error } = await supabase
        .from("reserva")
        .select("*");

      if (error) {
        throw new Error(`Error al obtener reservas: ${error.message}`);
      }

      // Convertir las fechas obtenidas en formato string a objetos Date y formatearlas correctamente
      return reservas.map((reserva) => ({
        date: new Date(reserva.date), // Convertir la fecha a un objeto Date
        hour: reserva.hour,
        name: reserva.name,
        email: reserva.email,
        phone: reserva.phone,
      }));
    } catch (err: any) {
      throw new Error(`Error al obtener reservas: ${err.message}`);
    }
  }