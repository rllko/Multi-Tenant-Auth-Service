import NextAuth from 'next-auth'

const handler = NextAuth()

export handler as {handler as GET, handler as POST}