"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialReactTable } from "material-react-table";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import useAuthStore from "../../store/authStore";

export default function SurveysPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [tableData, setTableData] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Load surveys
  useEffect(() => {
    if (!user) return;

    const fetchSurveys = async () => {
      const colRef = collection(db, "surveys");
      const snapshot = await getDocs(colRef);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTableData(data);
    };

    fetchSurveys();
  }, [user]);

  const handleDeleteRow = async (row) => {
    await deleteDoc(collection(db, "surveys").doc(tableData[row.index].id));
    setTableData(tableData.filter((_, i) => i !== row.index));
  };

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "title", header: "Titel" },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Button
        color="secondary"
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => setCreateModalOpen(true)}
      >
        Neue Umfrage erstellen
      </Button>

      <MaterialReactTable
        columns={columns}
        data={tableData}
        renderRowActions={({ row }) => (
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <Tooltip title="Editieren">
              <IconButton onClick={() => router.push(`/editor/${row.original.id}`)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Löschen">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />

      <CreateSurveyModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={(newSurvey) => {
          setTableData([...tableData, newSurvey]);
          setCreateModalOpen(false);
        }}
      />
    </Box>
  );
}

// Modal zum Erstellen neuer Umfragen
function CreateSurveyModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (!title) return;
    const newSurvey = { id: Date.now().toString(), title };
    onSubmit(newSurvey);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Neue Umfrage erstellen</DialogTitle>
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
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSubmit} variant="contained">
          Erstellen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
