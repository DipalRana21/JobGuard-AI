import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({

    adapter: PrismaAdapter(prisma),

    providers: [
       GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string, 
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
       }),

       GithubProvider({
        clientId: process.env.GITHUB_CLIENT_ID as string, 
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
       }),
    ],

    // 3. Use JSON Web Tokens for session management
    session: {
        strategy: "jwt",
    },

    // 4. Attach the Database User ID to the frontend session
    callbacks: {
        async session({session, token}) {
            if(session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };