"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "../store/authStore";
import Layout from "../components/Layout";

export default function RootLayout({ children }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initAuth = useAuthStore((state) => state.initAuth);

  const router = useRouter();
  const pathname = usePathname();

  const publicPages = ["/signin", "/signup"];

  // Auth Listener starten
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Redirect, wenn nicht eingeloggt
  useEffect(() => {
    if (!loading && !user && !publicPages.includes(pathname)) {
      router.push("/signin");
    }
  }, [user, loading, pathname, router]);

  return (
    <html lang="de">
      <body style={{ margin: 0 }}>
        {!user && !publicPages.includes(pathname) ? (
          <p>Lädt...</p>
        ) : (
          <Layout>{children}</Layout>
        )}
      </body>
    </html>
  );
}
