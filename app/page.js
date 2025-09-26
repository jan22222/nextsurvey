"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { db } from "@/lib/firebase";

export default function HomePage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const colRef = collection(db, "surveys");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSurveys(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Verfügbare Umfragen
      </Typography>

      <Box sx={{ mt: 4 }}>
        {surveys.length === 0 ? (
          <Typography variant="body1">Keine Umfragen vorhanden.</Typography>
        ) : (
          surveys.map((survey) => (
            <Box
              key={survey.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                p: 2,
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <Typography variant="h6">{survey.title}</Typography>
              <Link href={`/votes/${survey.creatorId}/${survey.id}`} passHref>
                <Button variant="contained" color="primary">
                  Teilnehmen
                </Button>
              </Link>
            </Box>
          ))
        )}
      </Box>
    </Container>
  );
}
