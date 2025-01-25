"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "./LogoutButton";
import { Button } from "@/components/ui/button";
import { CalendarIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import DownloadButton from "@/components/ui/DownloadButton";
import { Skeleton } from "@/components/ui/skeleton";
import { PDFViewer } from "@react-pdf/renderer";
import BookingPDF from "@/components/ui/BookingPDF";
import { User } from "@supabase/supabase-js";
import { CancelarReserva } from "./action";
import { AvatarImage } from "@radix-ui/react-avatar";
import Image from "next/image";
import { isFirstTime } from "../admin/actions";
import { PersonIcon } from "@radix-ui/react-icons";
interface Booking {
  id: number;
  service: string;
  name: string;
  date: string;
  hour: string | number;
  status: string;
}

export default function Page() {
  const [state, setState] = useState<{
    user: User | null;
    bookingsData: Booking[];
    selectedBooking: Booking | null;
    loading: boolean;
  }>({
    user: null,
    bookingsData: [],
    selectedBooking: null,
    loading: true,
  });
  const [isFirst, setIsFirst] = useState<boolean | null>(null);
  console.log(isFirst);


  // Llamada al server action
  useEffect(() => {
    const fetchIsFirstTime = async () => {
      try {
        const result = await isFirstTime();
        setIsFirst(result);
      } catch (error) {
        console.error("Error obteniendo el estado de isFirstTime:", error);
      }
    };

    fetchIsFirstTime();
  }, []);

  const supabase = createClient();
  const fetchUserAndBookings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: bookings, error } = await supabase
          .from("reservas")
          .select("*")
          .eq("email", user.email);

        if (error) throw new Error(error.message);


        setState({
          user,
          bookingsData: bookings || [],
          selectedBooking: null,
          loading: false,
        });
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching user or bookings:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [supabase]);

  useEffect(() => {
    fetchUserAndBookings();
  }, [fetchUserAndBookings]);

  const handleCancel = async (formData: FormData) => {
    try {
      const response = await CancelarReserva(formData);

      if (response.success) {
        const idToDelete = Number(formData.get("id"));
        setState((prev) => ({
          ...prev,
          bookingsData: prev.bookingsData.filter((booking) => booking.id !== idToDelete),
        }));
      } else {
        console.error("Error al cancelar la reserva:", response.error);
      }
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
    }
  };
  const { user, bookingsData, selectedBooking, loading } = state;
  // Calculate the count of completed bookings
  const completedBookingsCount = bookingsData.filter(
    (booking) => booking.status === "completed"
  ).length;

  // Define ranking system
  const getBadge = (count: number) => {
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

  const badge = getBadge(completedBookingsCount);

  return (
    <div className="relative min-h-screen w-full mx-auto bg-gradient-to-br from-[#1A1A1A] to-[#2C2C2C] text-gray-200 flex flex-col lg:flex-row">
      {/* Sidebar para Reservas Completadas */}

      {/* Contenido principal */}
      <div className="flex-1">
        {/* Header de Usuario */}
        <header className="relative w-full bg-gradient-to-r from-[#333333] to-[#444444] py-8 px-6 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/80 z-0">
            <img src="/bg2.webp" className="object-cover w-full h-full opacity-20 object-top" />
          </div>
          <div className="relative z-10 container mx-auto flex flex-col items-center text-center">
            {loading ? (
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : (
              <>
                <Avatar className="h-24 w-24 shadow-md my-2">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"}
                    alt="Avatar del usuario"
                    className="object-cover"
                  />
                  <AvatarFallback>
                    <User2Icon className="w-8 h-8 text-gray-500" />
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-semibold text-white">
                  Hola, {user?.user_metadata?.full_name || user?.email || "Usuario"} 👋
                </h1>
                <Avatar className="mt-2">
                  <AvatarImage className="w-20 h-20 object-cover" src={badge.src} />

                </Avatar>
                <Badge className={`absolute bottom-10 ${badge.color}`}>
                  {badge.label}
                </Badge>

                <div className="mt-10">
                  <LogoutButton />
                </div>
              </>
            )}
          </div>
        </header>

        {/* Turnos Reservados */}
        <main className="container mx-auto max-w-5xl p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white">Tus Turnos Reservados</h2>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-4" />
            ))
          ) : bookingsData.filter((booking) => booking.status === "pending").length === 0 ? (
            <div className="text-center text-gray-400">
              <p>No tienes turnos reservados aún.</p>
              <Button className="mt-4 bg-[#D4AF37] text-black hover:bg-[#E2C069]">
                <Link href="/reserva">¡Reserva tu turno ahora!</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookingsData
                .filter((booking) => booking.status === "pending") // Mostrar solo reservas pendientes
                .map((booking) => (
                  <Card
                    key={booking.id}
                    className="bg-[#2C2C2C] shadow-md hover:shadow-lg transition-all"
                  >
                    <CardContent className="p-4">
                      <h3 className="text-lg font-bold text-white">{booking.service}</h3>
                      <p className="text-sm text-gray-400">Nombre: {booking.name}</p>
                      <p className="text-sm text-gray-400">Fecha: {booking.date}</p>
                      <p className="text-sm text-gray-400">Estado: Pendiente</p>
                      <p className="text-sm text-gray-400">Hora: {booking.hour}</p>
                      <div className="mt-4 flex justify-between">
                        <Button
                          size="sm"
                          className="bg-gray-700 text-white hover:bg-gray-600"
                          onClick={() => setState((prev) => ({ ...prev, selectedBooking: booking }))}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" /> Ver Detalles
                        </Button>
                        <form>
                          <input type="hidden" name="id" value={booking.id} />
                          <Button
                            size="sm"
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={async () => {
                              const formData = new FormData();
                              formData.append("id", booking.id.toString());
                              await handleCancel(formData);
                            }}
                          >
                            Cancelar Turno
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </main>

      </div>
      <aside className="lg:w-1/4 w-full bg-[#2C2C2C] border-b lg:border-r border-[#444444] shadow-lg p-4">
        <h2 className="text-xl font-semibold text-center text-[#D4AF37] mb-4">
          Reservas Completadas
        </h2>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-4" />
          ))
        ) : bookingsData.filter((booking) => booking.status === "completed").length === 0 ? (
          <p className="text-sm text-gray-400 text-center">
            No tienes reservas completadas aún.
          </p>
        ) : (
          <ul className="space-y-4">
            {bookingsData
              .filter((booking) => booking.status === "completed") // Mostrar solo reservas completadas
              .map((booking) => (
                <li
                  key={booking.id}
                  className="p-4 bg-[#1A1A1A] rounded-lg shadow hover:shadow-md transition-all"
                >
                  <p className="text-sm text-gray-400">
                    Servicio: <span className="text-white">{booking.service}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Fecha: <span className="text-white">{booking.date}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Hora: <span className="text-white">{booking.hour}</span>
                  </p>
                </li>
              ))}
          </ul>
        )}
      </aside>
    </div>


  );
}