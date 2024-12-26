import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import logo from "@/app/public/logo.png"
// Estilos mejorados
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f3f4f6", // Fondo gris claro
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: "2 solid #333333",
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937", // Azul oscuro
    textAlign: "center",
    marginTop: 10,
  },
  section: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    border: "1 solid #d1d5db",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151", // Gris oscuro
  },
  text: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    color: "#6b7280", // Gris más claro
    borderTop: "1 solid #e5e7eb",
  },
});

export default function BookingPDF({ booking }: { booking: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Image
            src="https://diymvatafxdxkfvkizrg.supabase.co/storage/v1/object/public/Logo/png.png?t=2024-12-17T15%3A27%3A12.659Z" // Verifica si está en la carpeta /public
            style={styles.logo}
          />
          <Text style={styles.title}>Detalles de la Reserva</Text>
        </View>

        {/* Contenido principal */}
        <View style={styles.section}>
          <Text style={styles.label}>Servicio:</Text>
          <Text style={styles.text}>{booking.service}</Text>

          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.text}>{booking.name}</Text>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.text}>{booking.date}</Text>

          <Text style={styles.label}>Hora:</Text>
          <Text style={styles.text}>{booking.hour}</Text>
        </View>

        {/* Pie de página */}
        <Text style={styles.footer}>
          Gracias por elegir nuestros servicios. ¡Te esperamos pronto!
        </Text>
      </Page>
    </Document>
  );
}
