"use client";

import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  CrossIcon,
  Edit2Icon,
  FileEdit,
  SidebarClose,
  SidebarCloseIcon,
} from "lucide-react";
import { ToastClose } from "./ui/toast";
import { Cross1Icon } from "@radix-ui/react-icons";

export default function ProfileForm({ userId }: { userId: string | any }) {
  const supabase = createClient();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  // Obtener la URL de la imagen del usuario al cargar el componente
  useEffect(() => {
    const fetchImageUrl = async () => {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(`public/${userId}/avatar.jpg`);
      if (data?.publicUrl) {
        setImageUrl(data.publicUrl);
        console.log(data.publicUrl);
      }
    };

    fetchImageUrl();
  }, [userId]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file && file.type.startsWith("image/")) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("Por favor, selecciona un archivo de imagen.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (image) {
      setLoading(true);
      setErrorMessage(null);

      try {
        // Subir la imagen al Storage
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(`public/${userId}/avatar.jpg`, image, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          throw new Error(error.message);
        }

        // Obtener la URL pública de la imagen
        const imageUrl = supabase.storage
          .from("avatars")
          .getPublicUrl(data.path).data.publicUrl;

        setImageUrl(imageUrl);
        console.log("Imagen subida correctamente:", imageUrl);
      } catch (error) {
        setErrorMessage("Error al subir la imagen: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-start m-2 relative max-w-xl mx-auto">
      {isClicked ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center mt-4"
        >
          <div className="flex">
            <Button type="submit" className=" rounded" disabled={loading}>
              {loading ? "Subiendo..." : "Subir Imagen"}
            </Button>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            <Button className="" onClick={() => setIsClicked(false)}>
              <Cross1Icon />
            </Button>
          </div>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </form>
      ) : (
        <>
          <Button onClick={() => setIsClicked(true)}>
            <FileEdit size={14}  className="mr-1"/>
            Editar foto de perfil
          </Button>
        </>
      )}
    </div>
  );
}
