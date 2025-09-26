"use client";

import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { Box } from "@mui/material";

export default function Layout({ children, darkMode, setDarkMode, user }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* Topbar über gesamte Breite */}
      <Topbar user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Hauptbereich: Sidebar links, Content rechts */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {/* Sidebar */}
        <Box
          component="aside"
          sx={{
            width: { xs: 60, md: 240 },
            bgcolor: "background.paper",
            borderRight: 1,
            borderColor: "divider",
          }}
        >
          <Sidebar darkMode={darkMode}/>
        </Box>

        {/* Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            bgcolor: "background.default",
            minHeight: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
