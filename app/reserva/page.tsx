// import LastReserva from "@/components/ui/LastReserva";
import Reservas from "@/components/ui/Reserva";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function ReservaPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (!data) {
    redirect("/");
  }
  return (
    <div className="flex w-full items-center justify-center">
      <Reservas />
    </div>
  );
}
