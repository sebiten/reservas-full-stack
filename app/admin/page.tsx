import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { CancelarReservaAdmin, completeReservation } from './actions';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/constantes';

interface Booking {
  id: string;
  name: string;
  service: string;
  date: string;
  hour: string;
  status: string;
}

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  // Si no hay sesión, redirigir al inicio de sesión
  if (!user) {
    redirect('/login');
    return null;
  }

  const { data: profile, error } = await (await supabase).from("profiles")
    .select("isAdmin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.isAdmin) {
    redirect('/');
    return null;
  }

  // Fetch pending reservations
  const { data: pendingBookings } = await (await supabase)
    .from("reservas")
    .select("*")
    .eq("status", "pending")
    .order("date", { ascending: false })
    .order("hour", { ascending: true });

  // Fetch completed reservations
  const { data: completedBookings } = await (await supabase)
    .from("reservas")
    .select("*")
    .eq("status", "completed");

  return (
    <section className="w-full bg-[#1A1A1A] min-h-screen py-6 mx-auto">
      <div className="container mx-auto px-4 space-y-6">
        <div className=" gap-6 items-center justify-center">
          {/* Reservas Pendientes */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-semibold text-center text-[#D4AF37] mb-2">
              Reservas Pendientes
            </h1>
            <p className="text-center text-gray-400 text-sm mb-4">
              Presiona Completar cuando el corte haya finalizado o Cancelar para anular la cita y notificar por correo.
            </p>

            <div className="overflow-x-auto bg-[#2C2C2C] rounded-lg shadow-lg border border-[#444444]">
              <table className="min-w-full text-gray-200">
                <thead>
                  <tr className="text-left text-sm text-[#D4AF37]">
                    <th className="px-6 py-3 font-medium">Acción</th>
                    <th className="px-6 py-3 font-medium">Usuario</th>
                    <th className="px-6 py-3 font-medium">Hora</th>
                    <th className="px-6 py-3 font-medium">Fecha</th>
                    <th className="px-6 py-3 font-medium">Servicio</th>
                    <th className="px-6 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBookings?.map((booking: Booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-[#444444] hover:bg-[#3A3A3A] transition"
                    >
                      <td className="px-2 py-4 flex flex-wrap gap-4">
                        <form action={completeReservation}>
                          <input type="hidden" name="id" value={booking.id} />
                          <Button

                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            Completar
                          </Button>
                        </form>
                        <form action={CancelarReservaAdmin}>
                          <input type="hidden" name="id" value={booking.id} />
                          <Button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          >
                            Cancelar
                          </Button>
                        </form>
                      </td>
                      <td className="px-6 py-4 text-sm">{booking.name}</td>
                      <td className="px-4 py-4 text-sm">{booking.hour}</td>
                      <td className="px-2 py-4 text-sm">{formatDate(booking.date)}</td>
                      <td className="px-6 py-4 text-sm">{booking.service}</td>
                      <td
                        className={`px-6 py-4 text-sm font-semibold ${booking.status === "completed"
                          ? "text-green-400"
                          : booking.status === "pending"
                            ? "text-yellow-400"
                            : "text-gray-400"
                          }`}
                      >
                        {booking.status === "completed"
                          ? "Completada"
                          : booking.status === "pending"
                            ? "Pendiente"
                            : "Desconocido"}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Reservas Completadas */}
          {/* <div className="md:col-span-1">
            <h1 className="text-2xl font-semibold text-center text-[#D4AF37] mb-4">
              Reservas Completadas
            </h1>
            <div className="bg-[#2C2C2C] border border-[#444444] rounded-lg shadow-lg p-4">
              {completedBookings?.length ? (
                <ul className="space-y-4">
                  {completedBookings.map((booking: Booking) => (
                    <li
                      key={booking.id}
                      className="p-4 bg-[#1A1A1A] rounded-lg shadow hover:shadow-md transition"
                    >
                      <p className="text-gray-200 text-sm font-medium">
                        Usuario: {booking.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Servicio: {booking.service}
                      </p>
                      <p className="text-gray-400 text-sm">Fecha: {booking.date}</p>
                      <p className="text-gray-400 text-sm">Hora: {booking.hour}</p>
                      <p
                        className={`text-sm font-semibold ${booking.status === "completed"
                          ? "text-green-400"
                          : booking.status === "pending"
                            ? "text-yellow-400"
                            : "text-gray-400"
                          }`}
                      >
                        {booking.status === "completed"
                          ? "Completada"
                          : booking.status === "pending"
                            ? "Pendiente"
                            : "Desconocido"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm text-center">
                  No hay reservas completadas.
                </p>
              )}
            </div>
          </div> */}
        </div>
      </div>
    </section>


  );
}



// <section className="w-full bg-[#1A1A1A] min-h-screen py-6">
// <div className="container mx-auto px-4 space-y-6">
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//     {/* Reservas Pendientes */}
//     <div className="md:col-span-2">
//       <h1 className="text-3xl font-semibold text-center text-[#D4AF37] mb-4">
//         Reservas Pendientes
//       </h1>
//       <div className="overflow-x-auto bg-[#2C2C2C] rounded-lg shadow-lg border border-[#444444]">
//         <table className="min-w-full text-gray-200">
//           <thead>
//             <tr className="text-left text-sm text-[#D4AF37]">
//               <th className="px-6 py-3 font-medium">Acción</th>
//               <th className="px-6 py-3 font-medium">Usuario</th>
//               <th className="px-6 py-3 font-medium">Hora</th>
//               <th className="px-6 py-3 font-medium">Fecha</th>
//               <th className="px-6 py-3 font-medium">Servicio</th>
//               <th className="px-6 py-3 font-medium">Estado</th>
//             </tr>
//           </thead>
//           <tbody>
//             {pendingBookings?.map((booking: Booking) => (
//               <tr
//                 key={booking.id}
//                 className="border-b border-[#444444] hover:bg-[#3A3A3A] transition"
//               >
//                 <td className="px-2 py-4 flex flex-wrap gap-4">
//                   <form action={completeReservation}>
//                     <input type="hidden" name="id" value={booking.id} />
//                     <Button

//                       type="submit"
//                       className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//                     >
//                       Completar
//                     </Button>
//                   </form>
//                   <form action={CancelarReservaAdmin}>
//                     <input type="hidden" name="id" value={booking.id} />
//                     <Button
//                       type="submit"
//                       className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//                     >
//                       Cancelar
//                     </Button>
//                   </form>
//                 </td>
//                 <td className="px-6 py-4 text-sm">{booking.name}</td>
//                 <td className="px-6 py-4 text-sm">{booking.hour}</td>
//                 <td className="px-6 py-4 text-sm">{booking.date}</td>
//                 <td className="px-6 py-4 text-sm">{booking.service}</td>
//                 <td
//                   className={`px-6 py-4 text-sm font-semibold ${booking.status === "completed"
//                     ? "text-green-400"
//                     : booking.status === "pending"
//                       ? "text-yellow-400"
//                       : "text-gray-400"
//                     }`}
//                 >
//                   {booking.status === "completed"
//                     ? "Completada"
//                     : booking.status === "pending"
//                       ? "Pendiente"
//                       : "Desconocido"}
//                 </td>

//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//     {/* Reservas Completadas */}
//     <div className="md:col-span-1">
//       <h1 className="text-2xl font-semibold text-center text-[#D4AF37] mb-4">
//         Reservas Completadas
//       </h1>
//       <div className="bg-[#2C2C2C] border border-[#444444] rounded-lg shadow-lg p-4">
//         {completedBookings?.length ? (
//           <ul className="space-y-4">
//             {completedBookings.map((booking: Booking) => (
//               <li
//                 key={booking.id}
//                 className="p-4 bg-[#1A1A1A] rounded-lg shadow hover:shadow-md transition"
//               >
//                 <p className="text-gray-200 text-sm font-medium">
//                   Usuario: {booking.name}
//                 </p>
//                 <p className="text-gray-400 text-sm">
//                   Servicio: {booking.service}
//                 </p>
//                 <p className="text-gray-400 text-sm">Fecha: {booking.date}</p>
//                 <p className="text-gray-400 text-sm">Hora: {booking.hour}</p>
//                 <p
//                   className={`text-sm font-semibold ${booking.status === "completed"
//                     ? "text-green-400"
//                     : booking.status === "pending"
//                       ? "text-yellow-400"
//                       : "text-gray-400"
//                     }`}
//                 >
//                   {booking.status === "completed"
//                     ? "Completada"
//                     : booking.status === "pending"
//                       ? "Pendiente"
//                       : "Desconocido"}
//                 </p>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-gray-400 text-sm text-center">
//             No hay reservas completadas.
//           </p>
//         )}
//       </div>
//     </div>
//   </div>
// </div>
// </section>
