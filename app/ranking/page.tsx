"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface Ranking {
  email: string;
  name: string;
  completedOrders: number;
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data, error } = await supabase
          .from("reservas")
          .select("email, name, status")
          .eq("status", "completed");

        if (error) throw new Error(error.message);

        // Agrupa y cuenta las órdenes completadas por usuario
        const userOrders = data.reduce((acc: Record<string, Ranking>, order) => {
          const { email, name } = order;
          if (!acc[email]) {
            acc[email] = { email, name, completedOrders: 0 };
          }
          acc[email].completedOrders += 1;
          return acc;
        }, {});

        // Convierte a array y ordena por órdenes completadas
        const sortedRankings = Object.values(userOrders).sort(
          (a, b) => b.completedOrders - a.completedOrders
        );

        setRankings(sortedRankings);
      } catch (error) {
        console.error("Error fetching rankings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [supabase]);

  // Obtener badge según la cantidad de órdenes completadas
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

  return (
    <div className="relative min-h-screen w-full mx-auto bg-gradient-to-br from-[#1A1A1A] to-[#2C2C2C] text-gray-200 flex flex-col">
      {/* Contenido principal */}
      <div className="flex-1">
        <header className="relative w-full bg-gradient-to-r from-[#333333] to-[#444444] py-8 px-6 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/80 z-0">
            <img src="/bg2.webp" className="object-cover w-full h-full opacity-20 object-top" />
          </div>
          <div className="relative z-10 container mx-auto flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold text-white">
              Ranking de Usuarios
            </h1>
            <p className="text-gray-400 mt-2">
              Usuarios con la mayor cantidad de órdenes completadas.
            </p>
          </div>
        </header>

        <main className="container mx-auto max-w-5xl p-6 space-y-6">
          {loading ? (
            <div className="text-center text-gray-400">Cargando rankings...</div>
          ) : (
            <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-md">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-600">
                    <th className="py-2">Posición</th>
                    <th className="py-2">Nombre</th>
                    <th className="py-2">Cortes</th>
                    <th className="py-2">Rango</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((user, index) => {
                    const badge = getBadge(user.completedOrders);
                    return (
                      <tr
                        key={user.email}
                        className="border-b border-gray-600 hover:bg-[#3C3C3C]"
                      >
                        <td className=" text-gray-300 font-bold">{index + 1}</td>
                        <td className=" text-white">
                          {user.name || user.email}
                        </td>
                        <td className=" text-gray-300">
                          {user.completedOrders}
                        </td>
                        <td className="flex items-center">
                          <Image
                            src={badge.src}
                            alt={badge.label}
                            width={40}
                            height={40}
                            className="mt-6"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
