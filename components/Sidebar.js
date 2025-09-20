"use client";

import React from "react";
import Box from "@mui/material/Box";
import Navlist from "./Navlist";

export default function Sidebar() {
  return (
    <Box
      sx={{
        width: { xs: "80px", md: "300px" },
        display: "flex",
        flexDirection: "column",
        gap: "3px",
        backgroundColor: "#f5f5f5", // optional: Hintergrundfarbe
        height: "100vh", // Sidebar über gesamte Höhe
        borderRight: "1px solid #ddd", // optische Trennung
      }}
    >
      <Navlist />
    </Box>
  );
}
