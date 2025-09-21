"use client";

import React, { useEffect, useState } from "react";
import { Box, AppBar, Switch, Stack, Typography, Badge } from "@mui/material";
import { styled } from "@mui/material/styles";
import Brightness6Icon from "@mui/icons-material/Brightness6";
import MailIcon from "@mui/icons-material/Mail";
import Link from "next/link";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../lib/firebase";

const StyledStack = styled(Stack)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 20px",
}));

export default function Topbar({ user, mode, setMode }) {
  const [checked, setChecked] = useState(false);
  const [batchCounter, setBatchCounter] = useState(0);

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

  const handleChange = () => {
    setMode(mode === "dark" ? "light" : "dark");
    setChecked(!checked);
  };

  return (
    <Box>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "red", // statt makeStyles
          height: "120px",
          width: "100vw",
        }}
      >
        <StyledStack>
          {/* Titel */}
          <Typography
            sx={{
              width: { xs: 150, md: 600 },
              fontFamily: "Raleway",
              fontSize: { xs: "24px", md: "52px" },
            }}
          >
            Umfragen-Creator App
          </Typography>

          {/* User */}
          <Typography sx={{ fontFamily: "Raleway", fontSize: "24px" }}>
            {user?.uid ? user.email : "Ausgeloggt."}
          </Typography>

          {/* Icons + Switch */}
          <StyledStack spacing={2}>
            <Link href="/" passHref>
              <Badge
                badgeContent={batchCounter}
                color="secondary"
                sx={{ cursor: "pointer" }}
              >
                <MailIcon color="action" />
              </Badge>
            </Link>
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
