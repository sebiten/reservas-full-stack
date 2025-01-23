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
  servicecount,
}: {
  date: Date;
  name: string;
  email: string;
  phone: string;
  hour: string;
  service: string;
  servicecount: number | undefined;
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

    const isFirstReservation =
      !userReservations || userReservations.length === 0;

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
          servicecount: isFirstReservation ? 1 : (servicecount ?? 0) + 1,
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
      servicecount: reserva.servicecount,
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

export async function CancelarReservaAdmin(formData: FormData): Promise<void> {
  const id = formData.get("id");

  if (!id) {
    console.error("Error: ID no proporcionado.");
    return;
  }

  const supabase = createClient();

  // Obtener la información de la reserva antes de eliminarla
  const { data: reserva, error: fetchError } = await (await supabase)
    .from("reservas")
    .select("name, email, service, date, hour")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error obteniendo la reserva:", fetchError.message);
    return;
  }

  // Eliminar la reserva
  const { error: deleteError } = await (await supabase)
    .from("reservas")
    .delete()
    .eq("id", id);
  revalidatePath("/admin");

  if (deleteError) {
    console.error("Error al cancelar la reserva:", deleteError.message);
    return;
  }

  // Configurar el transporter de nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  // Opciones del correo
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: reserva?.email, // Correo del usuario
    subject: `Cancelación de reserva para ${reserva?.service}`,
    text: `Hola ${
      reserva?.name
    },\n\nTu reserva ha sido cancelada con éxito.\n\nDetalles de la reserva cancelada:\n- Servicio: ${
      reserva?.service
    }\n- Fecha: ${new Date(reserva?.date).toLocaleDateString()}\n- Hora: ${
      reserva?.hour
    }\n\nGracias por tu comprensión.`,
  };

  try {
    // Enviar el correo
    await transporter.sendMail(mailOptions);
    console.log("Correo de cancelación enviado con éxito.");
  } catch (error: any) {
    console.error("Error enviando el correo de cancelación:", error.message);
  }
}
