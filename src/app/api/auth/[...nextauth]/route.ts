import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH2_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // [중요] 구글 로그인이 성공하면 백엔드(Django)에 이 정보를 알리고 
          // 우리 시스템의 JWT 토큰을 받아오는 과정이 필요할 수 있습니다.
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: account.access_token }),
          });

          if (response.ok) {
            const data = await response.json();
            // 백엔드에서 준 토큰을 유저 객체에 저장해둡니다.
            (user as any).access = data.access; 
            return true;
          }
        } catch (error) {
          console.error("백엔드 연동 에러:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.access = (user as any).access;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).access = token.access;
      return session;
    },
  },
});

export { handler as GET, handler as POST };