"use client";

import { Button } from "@/components/ui/button";
import { logout } from "./action";
import { DoorClosed, DoorClosedIcon, LogOut } from "lucide-react";

export default function LogoutButton() {
  return <Button className="flex gap-1 bg-inherit" onClick={() => logout()}> <LogOut size={17}/>Cerrar Sesión</Button>;
}
