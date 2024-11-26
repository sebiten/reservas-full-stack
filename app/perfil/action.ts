"use server";

import { redirect } from "next/navigation";
import { Reserva } from "@/components/ui/Reserva";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Función para cerrar sesión
export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// photo
export async function photo(file: File) {
  "use server";
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const userId = user?.id;

  if (error) {
    console.error(error);
    return null;
  }

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(`public/${userId}/avatar.jpg`, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error(uploadError);
    return null;
  }

  // Obtener la nueva URL pública
  const { data: newAvatar } = supabase.storage
    .from("avatars")
    .getPublicUrl(`public/${userId}/avatar.jpg`);

  return newAvatar?.publicUrl;
}

// Función para subir una reserva
export async function subirReserva({
  date,
  name,
  email,
  phone,
  hour,
  service,
}: {
  date: Date;
  name: string;
  email: string;
  phone: string;
  hour: string;
  service: string;
}) {
  try {
    // Crear el cliente de Supabase
    const supabase = createClient();

    // Convertir la fecha a formato 'YYYY-MM-DD'
    const formattedDate = date.toISOString().split("T")[0];

    // Verificar si ya existe una reserva para la misma fecha y hora
    const { data: existingReservation, error: errorFetch } = await supabase
      .from("reservas")
      .select("*")
      .eq("date", formattedDate)
      .eq("hour", hour)
      .limit(1);

    if (errorFetch) {
      throw new Error(
        `Error al verificar reserva existente: ${errorFetch.message}`
      );
    }

    // Si ya existe una reserva, devolver un mensaje de error
    if (existingReservation && existingReservation.length > 0) {
      return {
        success: false,
        message: "Ya existe una reserva para esta fecha y hora.",
      };
    }

    // Insertar la nueva reserva en la tabla "reserva"
    const { data, error } = await supabase
      .from("reservas")
      .insert([
        {
          date: formattedDate,
          name,
          email,
          phone,
          hour,
          service,
        },
      ])
      .select();
    console.log(date, name, email, phone, hour, service);

    // Recargar la página después de crear la reserva
    revalidatePath("/");

    if (error) {
      throw new Error(`Error al insertar reserva: ${error.message}`);
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// Función para obtener todas las reservas
export async function obtenerReservas(): Promise<Reserva[]> {
  try {
    const supabase = createClient();

    // Obtener todas las reservas de la base de datos
    const { data: reservas, error } = await supabase
      .from("reservas")
      .select("*");

    if (error) {
      throw new Error(`Error al obtener reservas: ${error.message}`);
    }

    // Convertir las fechas a objetos Date y devolver el arreglo de reservas
    return reservas.map((reserva) => ({
      date: new Date(reserva.date),
      hour: reserva.hour,
      name: reserva.name,
      email: reserva.email,
      phone: reserva.phone,
      service: reserva.service,
    }));
  } catch (err: any) {
    throw new Error(`Error al obtener reservas: ${err.message}`);
  }
}
