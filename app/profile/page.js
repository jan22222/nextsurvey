"use client";

import { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import useAuthStore from "@/store/authStore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDisplayName(docSnap.data().displayName || "");
        }
      } catch (err) {
        console.error("Fehler beim Laden des Profils:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { displayName },
        { merge: true }
      );
      alert("Profil gespeichert!");
    } catch (err) {
      console.error("Fehler beim Speichern des Profils:", err);
    }
  };

  if (!user) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography variant="h6">Bitte einloggen, um dein Profil zu bearbeiten.</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography>Lädt...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6, maxWidth: 600 }}>
      <Typography variant="h4" gutterBottom>
        Dein Profil
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <TextField
          label="E-Mail"
          value={user.email}
          InputProps={{ readOnly: true }}
        />
        <Button variant="contained" onClick={handleSave}>
          Speichern
        </Button>
      </Box>
    </Container>
  );
}
