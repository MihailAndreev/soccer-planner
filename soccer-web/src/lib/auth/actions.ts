"use server";

import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { clearSession, createSession } from "./session";

export type AuthActionState = {
  error?: string;
};

function readRequiredString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = readRequiredString(formData, "name");
  const email = readRequiredString(formData, "email").toLowerCase();
  const password = readRequiredString(formData, "password");

  if (!name || !email || !password) {
    return { error: "Please fill in all fields." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [createdUser] = await db
    .insert(users)
    .values({ email, name, passwordHash })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
    });

  if (!createdUser) {
    return { error: "Could not create your account. Please try again." };
  }

  await createSession({
    userId: createdUser.id,
    email: createdUser.email,
    name: createdUser.name,
  });

  redirect("/");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readRequiredString(formData, "email").toLowerCase();
  const password = readRequiredString(formData, "password");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return { error: "Invalid email or password." };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
