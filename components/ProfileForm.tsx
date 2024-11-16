"use client";

import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export default function ProfileForm({ userId }: { userId: string | any }) {
  const supabase = createClient();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Obtener la URL de la imagen del usuario al cargar el componente
  useEffect(() => {
    const fetchImageUrl = async () => {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(`public/${userId}/avatar.jpg`);
      if (data?.publicUrl) {
        setImageUrl(data.publicUrl);
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
    <div className="flex flex-col items-center p-20">
      {/* Mostrar avatar del usuario */}
      <Avatar className="w-32 h-32">
        <AvatarImage
          src={imagePreview || imageUrl || ""}
          alt="Avatar del usuario"
          className="object-cover"
        />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>

      <form onSubmit={handleSubmit} className="flex flex-col items-center mt-4">
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>

        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Subiendo..." : "Subir Imagen"}
        </button>
      </form>
    </div>
  );
}
