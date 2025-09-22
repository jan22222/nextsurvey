"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { MaterialReactTable } from "material-react-table";
import Link from "next/link";
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
import useAuthStore from "../../../store/authStore";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function SurveyQuestionsPage() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);

  const [questions, setQuestions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [text, setText] = useState("");

  const colRef = useMemo(() => {
    if (!user?.email) return null;
    return collection(db, `Surveys_${user.email}`, id, "questions");
  }, [user?.email, id]);

  useEffect(() => {
    if (!colRef) return;
    const fetchData = async () => {
      const snapshot = await getDocs(colRef);
      setQuestions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, [colRef]);

  const handleOpenDialog = (question = null) => {
    setEditQuestion(question);
    setText(question ? question.text : "");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditQuestion(null);
    setText("");
  };

  const handleSave = async () => {
    if (!text) return;
    if (editQuestion) {
      const docRef = doc(db, `Surveys_${user.email}`, id, "questions", editQuestion.id);
      await updateDoc(docRef, { text });
    } else {
      await addDoc(colRef, { text, createdAt: new Date() });
    }
    handleCloseDialog();
    const snapshot = await getDocs(colRef);
    setQuestions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleDelete = async (qId) => {
    await deleteDoc(doc(db, `Surveys_${user.email}`, id, "questions", qId));
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const columns = [
    {
      accessorKey: "text",
      header: "Frage",
    },
    {
      accessorKey: "id",
      header: "Aktionen",
      Cell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => handleOpenDialog(row.original)}>
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(row.original.id)}
          >
            Delete
          </Button>
          <Link href={`/survey/${id}/answers/${row.original.id}`} passHref>
            <Button variant="outlined" size="small">
              Downwire (Answers)
            </Button>
          </Link>
        </Stack>
      ),
    },
  ];

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Fragen der Umfrage</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Neue Frage
        </Button>
      </Stack>

      <MaterialReactTable columns={columns} data={questions} enablePagination={true} />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editQuestion ? "Frage bearbeiten" : "Neue Frage"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Frage"
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
