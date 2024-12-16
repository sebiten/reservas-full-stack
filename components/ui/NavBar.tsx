import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  // DropdownMenuRadioGroup,
  // DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
// import { createClient } from "@/utils/supabase/client";
// import { useState } from "react";
import { signOut } from "@/app/register/action";
import { User2, User2Icon, UserIcon, UserX2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { createClient } from "@/utils/supabase/server";

export async function NavBar({ user }: { user: User | null }) {
  return (
    <nav className="sticky p-4 z-50  border-b-2  w-full top-0  mx-auto flex items-center justify-around bg-white/95 dark:bg-zinc-950/95 ">
      <div className="flex flex-row-reverse items-center justify-center">
        <div className=" gap-4 hidden sm:grid">
          {/* {!user && (
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleLogin}
              >
                <FcGoogle />
                Login
              </Button>
            </div>
          )} */}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className=" h-12 flex gap-2 hover:text-blue-500 transition duration-300 focus:outline-none"
            >
              <Avatar>
                <AvatarImage
                  src={
                    user?.user_metadata.picture ||
                    user?.user_metadata?.avatar_url
                  }
                  alt="Avatar del usuario"
                  className="object-cover"
                />
                <AvatarFallback>
                  <User2Icon className="w-7 h-10" />
                </AvatarFallback>
              </Avatar>
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
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
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-72 shadow-lg  rounded-md p-2">
            <DropdownMenuLabel className="text-lg font-semibold text-center">
              Hola!👋 {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            {/* <DropdownMenuRadioGroup
              value={position}
              onValueChange={setPosition}
            >
              <DropdownMenuRadioItem
                value="link"
                className="text-lg"
              ></DropdownMenuRadioItem>
            </DropdownMenuRadioGroup> */}
            {/* Add your additional menu items here based on the user and other conditions */}
            {user ? (
              <form className="mt-2  flex justify-center items-center">
                <div className="w-full  max-w-4xl flex justify-center items-center text-sm">
                  {user ? (
                    <div className="flex items-center gap-2">
                      <Link href="/perfil">
                        <Button
                          type="button"
                          variant="outline"
                          className="hover:text-blue-500 transition duration-300"
                        >
                          Perfil
                        </Button>
                      </Link>
                      <Button
                        type="submit"
                        formAction={signOut}
                        className="py-2 px-4 rounded-md no-underline "
                      >
                        Cerrar Sesión
                      </Button>
                    </div>
                  ) : (
                    <Link href="/login">Iniciar Sesión</Link>
                  )}
                </div>
              </form>
            ) : (
              <>
                <div className="flex justify-evenly items-center">
                  <Link href="/ingreso">
                    <span className="mt-0 block text-sm  hover:text-blue-500 transition duration-300 focus:outline-none">
                      Ingresar
                    </span>
                  </Link>nn
                  <Link href="/registro">
                    <span className="hover:text-gray-300 text-sm transition duration-300">
                      Registrarse
                    </span>
                  </Link>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-center  gap-1">
        <div className="flex">
          <Link href="/">
            <Button
              className="md:text-md text-sm font-bold hover:text-blue-500 transition duration-300 focus:outline-none"
              variant="outline"
            >
              Inicio
            </Button>
          </Link>

          <Link href="/perfil">
            <Button
              className="md:text-md text-sm font-bold hover:text-blue-500 transition duration-300 focus:outline-none"
              variant="outline"
            >
              Turnos Reservados
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
