"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "../store/authStore";
import Layout from "../components/Layout"; // dein Layout mit Topbar & Sidebar
import "../app/globals.css"; // falls du global CSS brauchst

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initAuth = useAuthStore((state) => state.initAuth);

  // einmal Auth Listener starten
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Public Pages, die ohne Login erlaubt sind
  const publicPages = useMemo(() => ["/signin", "/signup"], []);

  // Redirect wenn User nicht eingeloggt ist
  useEffect(() => {
    if (!loading && !user) {
      const isPublic = publicPages.some((page) => pathname.startsWith(page));
      if (!isPublic) {
        router.push("/signin");
      }
    }
  }, [user, loading, pathname, publicPages, router]);

  return (
    <html lang="de">
      <body>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
