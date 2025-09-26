"use client";

import React from "react";
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import PollIcon from "@mui/icons-material/Poll";
import SettingsIcon from "@mui/icons-material/Settings";
import Link from "next/link";

export default function Sidebar({ darkMode }) {
  const theme = useTheme();

  const bgColor = darkMode ? theme.palette.background.paper : theme.palette.background.default;
  const textColor = darkMode ? "#fff" : "#000";
  const borderColor = darkMode ? "#333" : "#ddd";

  return (
    <Box
      component="aside"
      sx={{
        width: { xs: 60, md: 240 },
        height: "100vh",
        bgcolor: bgColor,
        color: textColor,
        borderRight: 1,
        borderColor: borderColor,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        p: 1,
      }}
    >
      <List sx={{ width: "100%" }}>
        <ListItem button component={Link} href="/" sx={{ width: "100%" }}>
          <ListItemIcon sx={{ minWidth: 40, color: textColor }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText
            primary="Home"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
        </ListItem>

        <ListItem button component={Link} href="/editor" sx={{ width: "100%" }}>
          <ListItemIcon sx={{ minWidth: 40, color: textColor }}>
            <PollIcon />
          </ListItemIcon>
          <ListItemText
            primary="Umfragen"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
        </ListItem>

        <Divider sx={{ my: 1, borderColor: borderColor }} />

        <ListItem button component={Link} href="/profile" sx={{ width: "100%" }}>
          <ListItemIcon sx={{ minWidth: 40, color: textColor }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Profil"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
        </ListItem>
      </List>
    </Box>
  );
}
