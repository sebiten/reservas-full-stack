"use server";
import nodemailer from "nodemailer";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Reserva } from "@/components/ui/Reserva";

// Función para cerrar sesión
export async function logout() {
  const supabase = createClient();
  await (await supabase).auth.signOut();
  redirect("/");
}

// photo
export async function photo(file: File) {
  "use server";
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await (await supabase).auth.getUser();
  const userId = user?.id;

  if (error) {
    console.error(error);
    return null;
  }

  const { error: uploadError } = await (await supabase).storage
    .from("avatars")
    .upload(`public/${userId}/avatar.jpg`, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error(uploadError);
    return null;
  }

  // Obtener la nueva URL pública
  const { data: newAvatar } = (await supabase).storage
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
    const { data: existingReservation, error: errorFetch } = await (
      await supabase
    )
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

    // Verificar si es la primera reserva del usuario según su email
    const { data: userReservations, error: userError } = await (await supabase)
      .from("reservas")
      .select("*")
      .eq("email", email);

    if (userError) {
      throw new Error(
        `Error al verificar reservas del usuario: ${userError.message}`
      );
    }

    // Insertar la nueva reserva en la tabla "reservas"
    const { data, error } = await (
      await supabase
    )
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

    if (error) {
      throw new Error(
        `Error al insertar reserva: Ya tienes una reserva realizada, por favor cancela la anterior y realiza otra nuevamente.`
      );
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
    const { data: reservas, error } = await (await supabase)
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
// Funcion para cancelar reserva
export async function CancelarReserva(formData: FormData) {
  const id = formData.get("id");
  const supabase = createClient();

  const { error } = await (await supabase)
    .from("reservas")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

