import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "./prisma";

// Password-only admin login (pairtalk-style): the password is checked against
// ADMIN_PASSWORD and the ADMIN account is provisioned/refreshed in the DB on
// every successful login, so DB-backed role guards keep working. The committed
// fallbacks are the working credentials for this storefront — override via env.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@jayfab.org";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Novejfab1224$";

// NextAuth v4 refuses to serve /api/auth/* in production without a secret.
// Prefer AUTH_SECRET from the host env; fall back to a random per-boot secret
// so admin login keeps working on un-configured deploys. Configure AUTH_SECRET
// on Railway for stable sessions across restarts.
const SESSION_SECRET =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (() => {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[auth] AUTH_SECRET not set — using a random per-boot secret. Set AUTH_SECRET on the host for stable sessions."
      );
    }
    return randomBytes(32).toString("base64");
  })();

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials?.password;
        if (!password) return null;

        // Password-only path (no email supplied): admin lock-screen login.
        // Verified against ADMIN_PASSWORD, then the ADMIN account is upserted
        // so requireAdmin() and the admin layout DB checks resolve correctly.
        if (!credentials?.email) {
          if (password !== ADMIN_PASSWORD) return null;
          const hashed = await hash(password, 10);
          const admin = await prisma.user.upsert({
            where: { email: ADMIN_EMAIL },
            // Re-hash on every login so the stored password stays in sync.
            update: { passwordHash: hashed, role: "ADMIN" },
            create: { email: ADMIN_EMAIL, passwordHash: hashed, role: "ADMIN" },
          });
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          };
        }

        // Email + password path for DB-backed accounts.
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        if (!user.passwordHash) return null;
        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = (user as { id?: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? "CUSTOMER";
        if (token.id) session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: SESSION_SECRET,
};
