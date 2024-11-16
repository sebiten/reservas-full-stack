"use client";

import React, { useState } from "react";
import { Input } from "./ui/input";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function ProfileForm(user: User) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const userId = user.id;
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
    const supabase = createClient();
    event.preventDefault();
    if (image) {
      setLoading(true);
      setErrorMessage(null);

      try {
        // Cargar la imagen en Supabase Storage
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(`public/${userId}/${image.name}`, image, {
            cacheControl: "3600",
            upsert: true, // Cambiar a true si quieres sobreescribir el archivo existente
          });

        if (error) {
          throw new Error(error.message);
        }

        // Obtener la URL del archivo cargado
        const imageUrl = supabase.storage
          .from("avatars")
          .getPublicUrl(data.path).data.publicUrl;
        console.log("Imagen subida correctamente:", imageUrl);
      } catch (error) {
        setErrorMessage("Error al subir la imagen: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center p-20">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>
        {imagePreview && (
          <div className="mt-4">
            <img
              src={imagePreview}
              alt="Previsualización"
              className="w-32 h-32 object-cover"
            />
          </div>
        )}
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
