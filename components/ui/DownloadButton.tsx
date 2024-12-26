"use client";

import React from "react";
import { pdf } from "@react-pdf/renderer";
import BookingPDF from "./BookingPDF";
import { Button } from "./button";

const DownloadButton = ({ selectedBooking }: { selectedBooking: any }) => {
  const downloadPdf = async () => {
    // Generar el blob del PDF con la información de selectedBooking
    const blob = await pdf(<BookingPDF booking={selectedBooking} />).toBlob();

    // Crear un enlace de descarga y dispararlo
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reserva.pdf";
    document.body.appendChild(link); // Necesario para Firefox
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={downloadPdf}
      className=" text-white px-4 py-2 mb-2 rounded-md  "
    >
      Descargar PDF
    </Button>
  );
};

export default DownloadButton;
