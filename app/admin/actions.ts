"use server"
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";

export async function completeReservation(data: FormData) {

  const supabase = createClient();
  const id = data.get("id") as string;
  const { error } = await (await supabase)
    .from("reservas")
    .update({ status: "completed" })
    .eq("id", id);

  if (error) {
    console.error("Error marking reservation as completed:", error);
  } else {
    console.log("Reservation completed:", id);
  }

  redirect("/admin"); // Reload the page to reflect changes
}

// Obtener isFirtTime del usuario autenticado true = primera vez, false = no es la primera vez
export async function isFirstTime() {
  const supabase = createClient();
  // Obtener al usuario autenticado
  const {
    data: { user },
    error: userError,
  } = await (await supabase).auth.getUser();

  if (userError || !user) {
    redirect("/"); // Redirigir si no hay usuario autenticado
    return null;
  }
  // Consultar la tabla "profiles" para obtener isFirstTime
  const { data: profile, error: profileError } = await (
    await supabase
  )
    .from("profiles")
    .select("isFirstTime") // Asegúrate de que la columna sea "isFirstTime"
    .eq("id", user.id) // Filtrar por el usuario autenticado
    .single();

  if (profileError || !profile) {
    console.error("Error obteniendo el perfil:", profileError);
    redirect("/"); // Redirigir en caso de error
    return null;
  }

  // Retornar el valor de isFirstTime
  return profile.isFirstTime;
}

// CANCELAR RESERVA ADMIN
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
