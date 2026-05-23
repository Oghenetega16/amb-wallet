import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn:  "/auth/signin",
    signOut: "/auth/signout",
    error:   "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image, plan: user.plan } as any;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) { token.id = user.id; token.plan = (user as any).plan ?? "free"; }
      if (trigger === "update" && session) {
        token.name  = session.name  ?? token.name;
        token.plan  = session.plan  ?? token.plan;
        token.image = session.image ?? token.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id   = token.id   as string;
        (session.user as any).plan = token.plan as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await db.portfolio.create({ data: { userId: user.id, name: "My Portfolio", isDefault: true } });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
