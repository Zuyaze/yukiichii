import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi')
        }

        const sql = neon(process.env.DATABASE_URL!)
        const result = await sql`
          SELECT * FROM admins WHERE email = ${credentials.email}
        `
        
        const admin = result[0]
        if (!admin) {
          throw new Error('Akun tidak ditemukan')
        }

        const isValid = await bcrypt.compare(credentials.password, admin.password_hash)
        if (!isValid) {
          throw new Error('Password salah')
        }

        return {
          id: admin.id.toString(),
          email: admin.email,
          role: admin.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}