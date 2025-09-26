"use client";

import React from "react";
import { useRouter } from "next/navigation";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Paper from "@mui/material/Paper";
import ListItemText from "@mui/material/ListItemText";
import ModeEdit from "@mui/icons-material/ModeEdit";
import SubjectIcon from "@mui/icons-material/Subject";
import AppRegistration from "@mui/icons-material/AppRegistration";
import Logout from "@mui/icons-material/Logout";
import Login from "@mui/icons-material/Login";

export default function NavList({ darkMode }) {
  const router = useRouter();

  const menuItems = [
    { text: "Umfragen", icon: <ModeEdit />, path: "/editor" },
    { text: "Home", icon: <SubjectIcon />, path: "/" },
    { text: "Signup", icon: <AppRegistration />, path: "/signup" },
    { text: "Signin", icon: <Login />, path: "/signin" },
    { text: "Logout", icon: <Logout />, path: "/logout" },
  ];

  return (
    <List>
      {menuItems.map((item) => (
              <Paper
        sx={{
          borderRadius: 0,
        }}
      >
          <ListItem key={item.text} disablePadding >
            <ListItemButton onClick={() => router.push(item.path)} sx={{ width: "300px", boxSizing: "border-box" }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }}/>
            </ListItemButton>
          </ListItem>
        </Paper>
      ))}
    </List>
  );
}
