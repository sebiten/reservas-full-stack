export const horarios = [
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];
export const serviciosOdontologia = [
  "Corte clásico",
  "Arreglo de barba",
  "Afeitado tradicional con navaja",
  "Coloración de cabello o barba",
  "Planchado o alisado capilar",
  "Servicio de niños",
];

   // Define ranking system
   export const getBadge = (count: number) => {
    if (count >= 15) {
      return { label: "Cliente VIP", color: "bg-purple-600", src: "/vipBadge.png" };
    } else if (count >= 10) {
      return { label: "Cliente Estrella", color: "bg-blue-600", src: "/estrellaBadge.png" };
    } else if (count >= 5) {
      return { label: "Cliente Frecuente", color: "bg-green-600", src: "/frecuenteBadge.png" };
    } else {
      return { label: "Cliente Nuevo", color: "bg-gray-600", src: "/novatoBadge.png" };
    }
  };

  export const formatDate = (dateString: string) => {
    // Asegúrate de que la fecha se trate como local sin cambios de zona horaria
    const [year, month, day] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day)); // Meses van de 0 a 11
    return date.toLocaleDateString("es-ES", {
      weekday: "long", // Nombre del día
      day: "numeric", // Número del día
      month: "long",  // Nombre completo del mes
    });
  };
