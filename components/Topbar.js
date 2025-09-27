"use client";

import React, { useEffect, useState } from "react";
import { Box, AppBar, Switch, Stack, Typography, Badge, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import Brightness6Icon from "@mui/icons-material/Brightness6";
import MailIcon from "@mui/icons-material/Mail";
import Link from "next/link";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import useAuthStore from "@/store/authStore";

const StyledStack = styled(Stack)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 20px",
}));

export default function Topbar({ user, darkMode, setDarkMode }) {
  const [batchCounter, setBatchCounter] = useState(0);
  const { logout } = useAuthStore();

  useEffect(() => {
    if (!user?.email) return;
    const colRef = collection(db, "Invitations " + user.email);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      let newCount = 0;
      snapshot.docs.forEach((doc) => {
        if (doc.data().watched === undefined) newCount++;
      });
      setBatchCounter(newCount);
    });
    return () => unsubscribe();
  }, [user?.email]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/signin";
    } catch (err) {
      console.error("Logout fehlgeschlagen:", err);
    }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: "red", height: "120px", width: "100vw" }}>
        <StyledStack>
          {/* Titel */}
          <Typography sx={{ width: { xs: 150, md: 600 }, fontFamily: "Raleway", fontSize: { xs: "24px", md: "52px" } }}>
            Umfragen-Creator App
          </Typography>

          {/* User Email + Logout */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography sx={{ fontFamily: "Raleway", fontSize: "24px" }}>
              {user?.uid ? user.email : "Ausgeloggt."}
            </Typography>
            {user?.uid && (
              <Button variant="outlined" color="inherit" size="small" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Stack>

          {/* Dark Mode + Badge */}
          <StyledStack spacing={2}>
            <Brightness6Icon />
            <Switch
              color="warning"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              inputProps={{ "aria-label": "Dark Mode Toggle" }}
            />
          </StyledStack>
        </StyledStack>
      </AppBar>
    </Box>
  );
}
