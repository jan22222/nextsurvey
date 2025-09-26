"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "../store/authStore";
import Layout from "../components/Layout";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import "../app/globals.css";

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initAuth = useAuthStore((state) => state.initAuth);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const publicPages = useMemo(() => ["/signin", "/signup"], []);

  useEffect(() => {
    if (!loading && !user) {
      const isPublic = publicPages.some((page) => pathname.startsWith(page));
      if (!isPublic) router.push("/signin");
    }
  }, [user, loading, pathname, publicPages, router]);

  // Theme erstellen
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          background: {
            default: darkMode ? "#121212" : "#f5f5f5",
            paper: darkMode ? "#1d1d1d" : "#fff",
          },
        },
      }),
    [darkMode]
  );

  return (
    <html lang="de">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Layout darkMode={darkMode} setDarkMode={setDarkMode} user={user}>
            {children}
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
