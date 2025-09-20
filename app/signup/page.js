"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

import emailjs from "@emailjs/browser";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";

const defaultTheme = createTheme();

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errormessage, setErrormessage] = useState("");

  function ValidateEmail(input) {
    const validRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (input.match(validRegex)) {
      return true;
    } else {
      setErrormessage("Email ungültig.");
      return false;
    }
  }

  function ValidatePassword(input) {
    if (input.length > 5) {
      return true;
    }
    setErrormessage("Passwort ungültig.");
    return false;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    emailjs.init("UyDRDWE8kWGKZilvk");

    if (ValidateEmail(email) && ValidatePassword(password)) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        console.log(user);

        // Beispiel E-Mail
        const sender = "jan.weitzel@gmail.com";
        const serviceId = "service_hsd4xpj";
        const templateId = "template_g72cq0o";
        const data = {
          sender,
          email,
          pw: password,
        };

        await emailjs.send(serviceId, templateId, data);
        alert("Per Email informiert.");
        alert("Erfolgreich registriert.");
        router.push("/signin");
      } catch (error) {
        console.error(error);
        setErrormessage(error.code || error.message);
      }
    } else {
      alert("Ungültige Email oder Passwort!");
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        {errormessage !== "" && (
          <Alert severity="error">
            {errormessage === "auth/wrong-password" && <>Passwort falsch.</>}
            {errormessage === "auth/invalid-email" && <>Email unbekannt.</>}
            {errormessage === "auth/email-already-in-use" && (
              <>Email wird bereits verwendet.</>
            )}
            <>({errormessage})</>
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
          <Typography component="h1" variant="h5">
            Einschreiben
          </Typography>
          <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Addresse"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
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
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Start
            </Button>
            <Grid container>
              <Grid item>
                <Link href="/signin" variant="body2">
                  {"Sie haben bereits einen Account? Login."}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
