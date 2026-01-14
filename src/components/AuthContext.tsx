'use client'; // [중요] 최상단에 이 코드가 반드시 있어야 함

import { SessionProvider } from "next-auth/react";

export default function AuthContext({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}