"use server";

import { z } from "zod";

import { createClient } from "@/utils/supabase/server";
// import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5), // Adjust the minimum length as needed
});

export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const loginUserValidation = loginSchema.safeParse({
    email,
    password,
  });

  if (!loginUserValidation.success) {
    return {
      error: true,
      message:
        loginUserValidation.error.issues[0]?.message ?? "An error occured",
    };
  }

  // supabase authentication from here
  const supabase = createClient();


  const { data, error } = await (await supabase).auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: true,
      message: error.message,
    };
  }

  if (!data.user) {
    return {
      error: true,
      message: "Login failed. Please try again.",
    };
  }

  // User successfully logged in
  return {
    success: true,
    message: "Login successful",
    user: {
      id: data.user.id,
      email: data.user.email,
      // Add any other user data you want to return
    },
  };
};
