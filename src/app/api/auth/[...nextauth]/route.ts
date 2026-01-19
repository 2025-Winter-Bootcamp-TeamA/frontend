import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // 백엔드가 없으므로 세션은 브라우저(JWT)에만 저장합니다.
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };