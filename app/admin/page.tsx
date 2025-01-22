import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { CancelarReservaAdmin } from "@/app/perfil/action"

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  // Si no hay sesión, redirigir al inicio de sesión
  if (!user) {
    redirect('/login');
    return null;
  }
  // Obtener datos del perfil del usuario autenticado
  const { data: profile, error } = await (await supabase).from("profiles")
    .select("isAdmin")
    .eq("id", user.id) // Filtrar por el usuario actual
    .single(); // Solo esperamos un registro

  if (error || !profile?.isAdmin) {
    redirect('/');
    return null;
  }

  const { data: bookings } = await (await supabase).from("reservas").select("*");

  return (
    <div className="p-6 space-y-6 w-1/2 mx-auto">
      <h1 className="text-3xl font-semibold text-center text-gray-800">Reservas de Todos los Usuarios</h1>

      {/* Tabla de Reservas */}
      <form className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="px-6 py-3 font-medium">Usuario</th>
              <th className="px-6 py-3 font-medium">Servicio</th>
              <th className="px-6 py-3 font-medium">Fecha</th>
              <th className="px-6 py-3 font-medium">Hora</th>
              <th className="px-6 py-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">{booking.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{booking.service}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{booking.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{booking.hour}</td>
                <td className="px-6 py-4 text-sm">
                  <form method="post" action={CancelarReservaAdmin}>
                    <input type="hidden" name="id" value={booking.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!window.confirm("¿Está seguro de que desea cancelar esta reserva?")) {
                          e.preventDefault(); // Evita que el formulario se envíe
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Cancelar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </form>
    </div>
  );
}
