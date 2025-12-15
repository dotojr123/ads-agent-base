import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials, req) {
        return { id: "user_1", name: "Demo User", email: "demo@example.com" }
      }
    })
  ],
  callbacks: {
    async session({ session, token }: any) {
        if (session.user) {
            session.user.id = "user_1"; // Mock ID
        }
        return session;
    }
  }
}
