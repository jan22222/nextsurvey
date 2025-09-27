"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";
import useAuthStore from "../../store/authStore";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";

const theme = createTheme();

export default function SignUpPage() {
  const router = useRouter();
  const { initAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errormessage, setErrormessage] = useState("");

  const muiTheme = useTheme();
  const textColor = muiTheme.palette.mode === "dark" ? "white" : "black";

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        initAuth();
        router.push("/");
      }
    } catch (error) {
      setErrormessage(error.code);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        {errormessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errormessage === "auth/email-already-in-use" && "Email wird bereits verwendet."}
            {errormessage === "auth/invalid-email" && "Ungültige Email."}
            {errormessage === "auth/weak-password" && "Passwort zu schwach."}
          </Alert>
        )}
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ color: textColor }}>
            Registrieren
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="displayName"
              label="Name"
              name="displayName"
              autoFocus
              onChange={(e) => setDisplayName(e.target.value)}
              InputProps={{ sx: { color: textColor } }}
              InputLabelProps={{ sx: { color: textColor } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Adresse"
              name="email"
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{ sx: { color: textColor } }}
              InputLabelProps={{ sx: { color: textColor } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Passwort"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{ sx: { color: textColor } }}
              InputLabelProps={{ sx: { color: textColor } }}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Registrieren
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button onClick={() => router.push("/signin")}>
                  Bereits registriert? Anmelden
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
