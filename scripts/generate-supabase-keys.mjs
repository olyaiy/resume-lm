#!/usr/bin/env node
// Generates a unique JWT secret plus matching Supabase anon and service_role keys
// for self-hosted ResumeLM (Docker Compose or Helm).
//
// Usage:
//   node scripts/generate-supabase-keys.mjs              # print values
//   node scripts/generate-supabase-keys.mjs .env.local   # write values into an env file
//
// Never reuse the values from another deployment or from documentation.

import { createHmac, randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const base64url = (input) =>
  Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

function signJwt(payload, secret) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${header}.${body}.${signature}`;
}

const jwtSecret = randomBytes(48).toString("base64url");
const iat = Math.floor(Date.now() / 1000);
const exp = iat + 60 * 60 * 24 * 365 * 5; // 5 years

const anonKey = signJwt({ role: "anon", iss: "supabase", iat, exp }, jwtSecret);
const serviceRoleKey = signJwt({ role: "service_role", iss: "supabase", iat, exp }, jwtSecret);

const values = {
  JWT_SECRET: jwtSecret,
  ANON_KEY: anonKey,
  SERVICE_ROLE_KEY: serviceRoleKey,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
};

const target = process.argv[2];

if (!target) {
  for (const [key, value] of Object.entries(values)) console.log(`${key}=${value}`);
  process.exit(0);
}

let lines = existsSync(target) ? readFileSync(target, "utf8").split("\n") : [];
for (const [key, value] of Object.entries(values)) {
  const index = lines.findIndex((line) => line.startsWith(`${key}=`));
  if (index >= 0) lines[index] = `${key}=${value}`;
  else lines.push(`${key}=${value}`);
}
writeFileSync(target, lines.join("\n").replace(/\n*$/, "\n"));
console.log(`Wrote JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY and the matching app keys to ${target}`);
