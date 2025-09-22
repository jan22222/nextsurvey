"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import useAuthStore from "../../store/authStore";

import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Stack,
} from "@mui/material";

export default function AnswerPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // Wenn nicht eingeloggt → zurück zum Login
  useEffect(() => {
    if (user === null) {
      router.push("/signin");
    }
  }, [user, router]);

  // Fragen laden
  useEffect(() => {
    const loadQuestions = async () => {
      const qCol = collection(db, "questions");
      const snapshot = await getDocs(qCol);
      const qList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(qList);
    };
    loadQuestions();
  }, []);

  // Antwort speichern
  const handleSubmit = async () => {
    try {
      const aCol = collection(db, "answers");
      await addDoc(aCol, {
        userId: user.uid,
        answers,
        createdAt: serverTimestamp(),
      });
      alert("Antworten gespeichert!");
      router.push("/"); // nach Home
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Umfrage beantworten
      </Typography>

      <Stack spacing={3}>
        {questions.map((q) => (
          <Paper key={q.id} sx={{ p: 2 }}>
            <Typography variant="h6">{q.text}</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Deine Antwort"
              value={answers[q.id] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              sx={{ mt: 1 }}
            />
          </Paper>
        ))}

        {questions.length > 0 && (
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Antworten absenden
          </Button>
        )}
      </Stack>
    </Box>
  );
}
