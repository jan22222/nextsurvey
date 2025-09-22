"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MaterialReactTable } from 'material-react-table';
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
import useAuthStore from "../../../../../store/authStore";
import { db } from "../../../../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from "firebase/firestore";

export default function AnswersPage({ params }) {
  const { id, id2 } = params; // id = surveyId, id2 = questionId
  const user = useAuthStore((state) => state.user);

  const [surveyTitle, setSurveyTitle] = useState("");
  const [answers, setAnswers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editAnswer, setEditAnswer] = useState(null);
  const [text, setText] = useState("");

  // Survey Titel laden
  useEffect(() => {
    if (!user?.email) return;
    const fetchSurvey = async () => {
      const docRef = doc(db, `Surveys_${user.email}`, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSurveyTitle(docSnap.data().title || "Unbenannte Umfrage");
      } else {
        setSurveyTitle("Umfrage nicht gefunden");
      }
    };
    fetchSurvey();
  }, [user?.email, id]);

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

  const columns = [
    { accessorKey: "text", header: "Antwort" },
    {
      accessorKey: "id",
      header: "Aktionen",
      Cell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => handleOpenDialog(row.original)}>Edit</Button>
          <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(row.original.id)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h4">{surveyTitle}</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>Neue Antwort</Button>
      </Stack>

      <MaterialReactTable
        columns={columns}
        data={answers}
        enablePagination
      />

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
