import NextAuth, { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Desabilitado temporariamente para permitir login Mock sem DB real conectado
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in url query string as ?error=
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          // Request ad scopes if user wants to use this account for ads immediately
          // But usually we want separate scopes. For "Login", minimal scope.
          // We will handle Ad connections separately.
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // MOCK LOGIN FOR DEVELOPMENT
        // Allows any email with password "123456" or just lets them in for now to unblock
        if (credentials?.email) {
            return {
                id: 'mock-user-id',
                name: 'Usuário Teste',
                email: credentials.email,
                image: null
            }
        }
        return null
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }

      return session
    },
    async jwt({ token, user }) {
      // MOCK ONLY: Removemos qualquer lógica de banco de dados para garantir o login
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
  },
}
