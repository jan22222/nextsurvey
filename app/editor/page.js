"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MaterialReactTable } from 'material-react-table';
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
import useAuthStore from "../../store/authStore"; // default export beachten
import { db } from "../../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function EditorPage() {
  const user = useAuthStore((state) => state.user);
  const [surveys, setSurveys] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editSurvey, setEditSurvey] = useState(null);
  const [title, setTitle] = useState("");

  const colRef = useMemo(() => {
    if (!user?.email) return null;
    return collection(db, `Surveys_${user.email}`);
  }, [user?.email]);

  useEffect(() => {
    if (!colRef) return;
    const fetchData = async () => {
      const snapshot = await getDocs(colRef);
      setSurveys(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };
    fetchData();
  }, [colRef]);

  const handleOpenDialog = (survey = null) => {
    setEditSurvey(survey);
    setTitle(survey ? survey.title : "");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditSurvey(null);
    setTitle("");
  };

  const handleSave = async () => {
    if (!title) return;
    if (editSurvey) {
      const docRef = doc(db, `Surveys_${user.email}`, editSurvey.id);
      await updateDoc(docRef, { title });
    } else {
      await addDoc(colRef, { title, createdAt: new Date() });
    }
    handleCloseDialog();
    // refresh
    const snapshot = await getDocs(colRef);
    setSurveys(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, `Surveys_${user.email}`, id));
    setSurveys(surveys.filter((s) => s.id !== id));
  };

  const handleDownload = (survey) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(survey));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${survey.title}.json`);
    dlAnchor.click();
  };

  const columns = [
    {
      accessorKey: "title",
      header: "Titel",
    },
    {
      accessorKey: "id",
      header: "Aktionen",
      Cell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenDialog(row.original)}
          >
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
          <Link href={`/editor/${row.original.id}`} passHref>
              <Button variant="outlined" size="small">
                Downwire (Questions)
              </Button>
            </Link>
        </Stack>
      ),
    },
  ];

  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Meine Umfragen</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Neue Umfrage
        </Button>
      </Stack>

      <MaterialReactTable
        columns={columns}
        data={surveys}
        enablePagination={true}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editSurvey ? "Umfrage bearbeiten" : "Neue Umfrage"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titel"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
