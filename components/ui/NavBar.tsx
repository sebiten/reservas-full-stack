import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { signOut } from "@/app/register/action";
import { Edit, Home, List, User2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function NavBar({ user }: { user: User | null }) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 p-3 bg-white/95 dark:bg-zinc-950/95 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo o sección izquierda */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-lg font-bold text-gray-800 hover:text-blue-700">
            BarberíaPro
          </Link>
        </div>

        {/* Botones centrales */}
        <div className="hidden sm:flex items-center space-x-2">
          <Link href="/">
            <Button
              className="md:text-md text-sm font-bold hover:text-blue-700 transition-all"
              variant="outline"
            >
              <Home size={17} />
              Inicio
            </Button>
          </Link>
          {user ? <Link href="/reserva">
            <Button
              className="md:text-md text-sm font-bold hover:text-blue-700 transition-all"
              variant="outline"
            >
              <Edit size={17} />
              Reservar
            </Button>
          </Link> : ""}

        </div>

        {/* Menú de usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt="Avatar del usuario" />
                <AvatarFallback>
                  <User2Icon className="w-6 h-6 text-gray-500" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 mt-2 shadow-lg rounded-md bg-white">
            <DropdownMenuLabel className="text-center font-semibold">
              Hola! 👋 {user?.email || "Invitado"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user ? (
              <div className="flex flex-col items-start px-2">
                <Link href="/perfil" className="w-full">
                  <Button
                    className="w-full justify-start hover:text-blue-500 transition-all"
                    variant="ghost"
                  >
                    <List size={17} className="mr-2" />
                    Mis Turnos
                  </Button>
                </Link>
                <form action={signOut} className="w-full">
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full justify-start "
                  >
                    Cerrar Sesión
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col px-2">
                <Link href="/ingreso">
                  <Button variant="outline" className="w-full mb-2">
                    Ingresar
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button variant="default" className="w-full">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menú hamburguesa para móviles */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2 hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 shadow-md rounded-md">
              <Link href="/" className="block p-2 hover:bg-gray-100 rounded-md">
                <Home className="inline mr-2" /> Inicio
              </Link>
              <Link href="/reserva" className="block p-2 hover:bg-gray-100 rounded-md">
                <Edit className="inline mr-2" /> Reservar
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
