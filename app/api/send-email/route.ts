import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    // Extraer y parsear el cuerpo de la solicitud
    const body = await req.json();
    const { email, name, date, hour, phone, service, servicecount } = body;

    // Validar que todos los parámetros requeridos estén presentes
    if (!email || !name || !date || !hour || !phone || !service || servicecount === undefined) {
      return NextResponse.json({ success: false, error: "Faltan parámetros obligatorios." }, { status: 400 });
    }

    // Configuración del transporter de nodemailer
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
      from: email,
      to: process.env.MAIL_RECEIVER_ADDRESS, // Enviar la confirmación al correo del usuario
      subject: `Confirmación de reserva para ${service}`,
      text: `Hola ${name},\n\nTu reserva ha sido confirmada.\n\nDetalles:\n- Fecha: ${new Date(
        date
      ).toLocaleDateString()}\n- Hora: ${hour}\n- Teléfono: ${phone}\n- Servicio: ${service}\n- Cantidad: ${servicecount}\n\nGracias por confiar en nosotros.`,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    // Responder con éxito
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Log de errores y respuesta al cliente
    console.error("Error enviando correo:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
