import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Hardcoded allowed users — passwords are bcrypt-hashed
const USERS = [
  {
    id: "1",
    email: "rmezzaz@gmail.com",
    // AutoPulse#Rm2026!
    passwordHash: "$2b$12$FfHgQX.kobNA1ifS55Q.P.JF4UaHAS5kCv0SCmAow9bTD17jQYPj.",
  },
  {
    id: "2",
    email: "eastcoastlogisticllc@gmail.com",
    // AutoPulse#Ec2026!
    passwordHash: "$2b$12$POLKxZLsD8kowmdlqiqQDeH2zj0i7EvojlFUFrpnDAYgdbqN0mdWe",
  },
  {
    id: "3",
    email: "abejaoui90@gmail.com",
    // AutoPulse#Ab2026!
    passwordHash: "$2b$12$DlGri9qoUise5GMLVCt89u2PTzbelMSiMmyozOmGdcnMkKQewdPjK",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = USERS.find(
          (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
        );
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.email.split("@")[0] };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
