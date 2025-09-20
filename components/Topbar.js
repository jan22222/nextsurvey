"use client";

import React, { useEffect, useState } from "react";
import { AppBar, Box, Stack, Typography, Badge, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";
import Brightness6Icon from "@mui/icons-material/Brightness6";
import MailIcon from "@mui/icons-material/Mail";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase"; // Pfad anpassen

const StyledStack = styled(Stack)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 20px",
}));

export default function Topbar({ user, mode, setMode }) {
  const [checked, setChecked] = useState(mode === "dark");
  const [batchCounter, setBatchCounter] = useState(0);

  useEffect(() => {
    if (!user?.email) return;

    const colRef = collection(db, `Invitations_${user.email}`);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      let counter = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.watched === undefined) {
          counter++;
        }
      });
      setBatchCounter(counter);
    });

    return () => unsubscribe();
  }, [user]);

  function handleChange() {
    if (mode === "dark") {
      setMode("light");
    } else {
      setMode("dark");
    }
    setChecked(!checked);
  }

  return (
    <Box>
      <AppBar
        position="static"
        sx={{
          height: "120px",
          background: "secondary",
          width: "100vw",
          fontSize: "1.2rem",
          justifyContent: "center",
        }}
      >
        <StyledStack>
          <Typography
            sx={{
              width: { xs: 150, md: 600 },
              fontFamily: "Raleway",
              fontSize: { xs: "24px", md: "52px" },
            }}
          >
            Umfragen-Creator App
          </Typography>

          {user ? (
            <Typography sx={{ fontFamily: "Raleway", fontSize: "24px" }}>
            {user.email}
            </Typography>
          ) : (
            <Typography sx={{ fontFamily: "Raleway", fontSize: "24px" }}>
            Ausgeloggt.
            </Typography>
          )}

          <StyledStack spacing={2}>
            <a href="/">
              <Badge badgeContent={batchCounter} color="secondary">
                <MailIcon color="action" />
              </Badge>
            </a>
            <Brightness6Icon />
            <Switch
              color="warning"
              checked={checked}
              onChange={handleChange}
              inputProps={{ "aria-label": "controlled" }}
            />
          </StyledStack>
        </StyledStack>
      </AppBar>
    </Box>
  );
}
