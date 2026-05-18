export const AUTH_COOKIE_NAME = "soccer_planner_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: number;
  email: string;
  name: string;
};

type JwtPayload = SessionPayload & {
  exp: number;
  iat: number;
};

function base64UrlEncode(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new TextDecoder().decode(bytes);
}

async function getSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
}

export async function signSessionToken(payload: SessionPayload) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedBody}`;
  const key = await getSigningKey(getJwtSecret());
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));

  return `${data}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const [encodedHeader, encodedBody, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedBody || !encodedSignature) {
    return null;
  }

  const key = await getSigningKey(getJwtSecret());
  const data = `${encodedHeader}.${encodedBody}`;
  const signature = Uint8Array.from(
    atob(encodedSignature.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(encodedSignature.length / 4) * 4, "=")),
    (char) => char.charCodeAt(0),
  );
  const isValid = await crypto.subtle.verify("HMAC", key, signature, new TextEncoder().encode(data));

  if (!isValid) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedBody)) as JwtPayload;

    if (!payload.userId || !payload.email || !payload.name || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
