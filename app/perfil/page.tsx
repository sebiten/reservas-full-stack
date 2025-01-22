"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "./LogoutButton";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";
import DownloadButton from "@/components/ui/DownloadButton";
import { Skeleton } from "@/components/ui/skeleton";
import { PDFViewer } from "@react-pdf/renderer";
import BookingPDF from "@/components/ui/BookingPDF";
import { User } from "@supabase/supabase-js";
import { CancelarReserva } from "./action";


interface Booking {
  id: number;
  service: string;
  name: string;
  date: string;
  hour: string | number;
  servicecount: number;
}

export default function Page() {
  const [state, setState] = useState<{
    user: User | null;
    bookingsData: Booking[];
    selectedBooking: Booking | null;
    loading: boolean;
    first: number;
  }>({
    user: null,
    bookingsData: [],
    selectedBooking: null,
    loading: true,
    first: 0,
  });

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

        const isFirst = bookings?.some((booking) => booking.servicecount === 1);

        setState({
          user,
          bookingsData: bookings || [],
          selectedBooking: null,
          loading: false,
          first: isFirst ? 1 : 0,
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

  // cancelar reserva
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

  const { user, bookingsData, selectedBooking, loading, first } = state;

  return (
    <div className="relative h-full min-h-screen w-full mx-auto bg-gray-50 mt-4">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white"></div>
    <div className="relative container mx-auto max-w-4xl p-6 flex flex-col items-center gap-8">
      {/* Perfil del Usuario */}
      <Card className="w-full max-w-5xl shadow-xl rounded-xl bg-white">
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-6 w-1/2 mb-4" /> {/* Nombre del usuario */}
            <div className="flex items-center space-x-4 mt-4">
              <Skeleton className="h-16 w-16 rounded-full" /> {/* Avatar */}
              <div>
                <Skeleton className="h-4 w-1/3 mb-2" /> {/* Metadata */}
                <Skeleton className="h-4 w-1/4" /> {/* Badge */}
              </div>
            </div>
          </div>
        ) : (
          <>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 shadow">
                  <AvatarFallback>{state.user?.email?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {state.user?.user_metadata?.full_name || state.user?.email || "Usuario"}
                  </CardTitle>
                  <Badge variant="outline" className="text-sm mt-1">
                    {state.first === 0 ? "Descuento Disponible (Primer Turno)" : "Cliente Regular"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-gray-600">
              <p className="text-base">
                ¡Bienvenido de nuevo! Aquí puedes ver tus turnos reservados y gestionar tu perfil.
              </p>
              <div className="w-full max-w-lg text-center animate-fade-in-up mt-2">
                <LogoutButton />
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Turnos Reservados */}
      <Card className="w-full max-w-4xl shadow-lg rounded-xl bg-white">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/3" /> {/* Texto del turno */}
                <Skeleton className="h-6 w-1/4" /> {/* Botón */}
              </div>
            ))}
          </div>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-gray-800 text-xl font-semibold">Turnos Reservados</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsData.length === 0 ? (
                <div className="text-center text-gray-500">
                  <p>No tienes turnos reservados aún.</p>
                  <Button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Link href="/reserva">¡Reserva tu turno ahora!</Link>
                  </Button>
                </div>
              ) : (
                bookingsData.map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center border-b pb-3">
                    <div>
                      <p className="font-medium text-gray-800">{booking.service}</p>
                      <p className="text-sm text-gray-500">{booking.name}</p>
                      <p className="text-sm text-gray-500">{booking.date}</p>
                      <p className="text-sm text-gray-500">{booking.hour}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setState((prev) => ({ ...prev, selectedBooking: booking }))}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" /> Ver Detalles
                      </Button>
                      <form>
                        <input type="hidden" name="id" value={booking.id} />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            const formData = new FormData();
                            formData.append("id", booking.id.toString());
                            await handleCancel(formData);
                          }}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" /> Cancelar Turno
                        </Button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </>
        )}
      </Card>

      {/* Visor de PDF */}
      {selectedBooking && (
        <div className="w-full max-w-lg h-[500px] rounded-md shadow-lg">
          <DownloadButton selectedBooking={selectedBooking} />
          <Suspense fallback={<div>Cargando visor PDF...</div>}>
            <PDFViewer width="100%" height="100%">
              <BookingPDF booking={selectedBooking} />
            </PDFViewer>
          </Suspense>
        </div>
      )}
    </div>
  </div>

  );
}
