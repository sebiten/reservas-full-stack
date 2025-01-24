"use client";

import { Button } from "@/components/ui/button";
import { logout } from "./action";
import { DoorClosed, DoorClosedIcon, LogOut } from "lucide-react";

export default function LogoutButton() {
  return <Button variant={"ghost"} className="flex gap-1 " onClick={() => logout()}> <LogOut size={17}/>Cerrar Sesión</Button>;
}
