
"use client";

import React from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar"; // falls du eine Sidebar hast
import { Box } from "@mui/material";
import useAuthStore from "../store/authStore";

export default function Layout({ children }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <p>Lädt...</p>; // optionaler Ladebildschirm
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      {/* Topbar, kann User als Prop bekommen */}
      <Topbar user={user} />

      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Sidebar optional */}
       <Sidebar />

        {/* Hauptinhalt */}
        <Box sx={{ flex: 1, p: 2, backgroundColor: "#f9f9f9" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}


