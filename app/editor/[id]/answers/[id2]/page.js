"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import useAuthStore from "../../../../store/authStore"; // default export
import { db } from "../../../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function AnswersPage({ params }) {
  const { id, id2 } = params; // id = surveyId, id2 = questionId
  const user = useAuthStore((state) => state.user);

  const [answers, setAnswers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editAnswer, setEditAnswer] = useState(null);
  const [text, setText] = useState("");

  const colRef = useMemo(() => {
    if (!user?.email) return null;
    return collection(db, `Answers_${user.email}_${id}_${id2}`);
  }, [user?.email, id, id2]);

  useEffect(() => {
    if (!colRef) return;
    const fetchData = async () => {
      const snapshot = await getDocs(colRef);
      setAnswers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, [colRef]);

  const handleOpenDialog = (answer = null) => {
    setEditAnswer(answer);
    setText(answer ? answer.text : "");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditAnswer(null);
    setText("");
  };

  const handleSave = async () => {
    if (!text) return;
    if (editAnswer) {
      const docRef = doc(db, `Answers_${user.email}_${id}_${id2}`, editAnswer.id);
      await updateDoc(docRef, { text });
    } else {
      await addDoc(colRef, { text, createdAt: new Date() });
    }
    handleCloseDialog();
    const snapshot = await getDocs(colRef);
    setAnswers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleDelete = async (answerId) => {
    await deleteDoc(doc(db, `Answers_${user.email}_${id}_${id2}`, answerId));
    setAnswers(answers.filter((a) => a.id !== answerId));
  };

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Antworten</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Neue Antwort
        </Button>
      </Stack>

      <Stack spacing={1}>
        {answers.map((answer) => (
          <Stack
            key={answer.id}
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Typography flex={1}>{answer.text}</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleOpenDialog(answer)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDelete(answer.id)}
            >
              Delete
            </Button>
          </Stack>
        ))}
      </Stack>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editAnswer ? "Antwort bearbeiten" : "Neue Antwort"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Antwort Text"
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button onClick={handleSave}>Speichern</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
