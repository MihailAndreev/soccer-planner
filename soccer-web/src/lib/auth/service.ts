import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { signSessionToken, type SessionPayload } from "./jwt";

export async function authenticateUser(emailValue: string, password: string) {
  const email = emailValue.trim().toLowerCase();

  if (!email || !password) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  return {
    token: await signSessionToken(payload),
    user: payload,
  };
}
