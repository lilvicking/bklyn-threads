import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "./prisma";

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
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        if (!user.passwordHash) return null;
        const valid = await compare(credentials.password, user.passwordHash);
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
