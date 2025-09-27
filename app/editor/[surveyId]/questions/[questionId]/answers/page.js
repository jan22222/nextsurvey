'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

export default function AnswerEditorPage() {
  const { surveyId, questionId } = useParams();
  const router = useRouter();

  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  const answersRef = collection(
    db,
    'surveys',
    surveyId,
    'questions',
    questionId,
    'answers'
  );

useEffect(() => {
  const answersRef = collection(
    db,
    'surveys',
    surveyId,
    'questions',
    questionId,
    'answers'
  );

  const unsub = onSnapshot(answersRef, (snapshot) => {
    const as = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAnswers(as);
    setLoading(false);
  });

  return () => unsub();
}, [surveyId, questionId]); // nur IDs als deps


  const addAnswer = async () => {
    if (!newAnswer.trim()) return;
    await addDoc(answersRef, {
      text: newAnswer.trim(),
      votes: 0, // Start mit 0 Stimmen
    });
    setNewAnswer('');
  };

  const deleteAnswer = async (answerId) => {
    await deleteDoc(
      doc(db, 'surveys', surveyId, 'questions', questionId, 'answers', answerId)
    );
  };

  return (
    <Container>
      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="outlined" onClick={() => router.back()}>
          Zurück
        </Button>
        <Typography variant="h4" gutterBottom>
          Antworten für Frage
        </Typography>
      </Stack>

      <Stack spacing={2} mb={3}>
        <TextField
          label="Neue Antwort eingeben"
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
        />
        <Button variant="contained" onClick={addAnswer}>
          Antwort hinzufügen
        </Button>
      </Stack>

      {loading ? (
        <p>Lade Antworten...</p>
      ) : (
        answers.map((a) => (
          <Stack
            key={a.id}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            mb={1}
          >
            <Typography sx={{ flexGrow: 1 }}>{a.text}</Typography>
            <Button color="error" onClick={() => deleteAnswer(a.id)}>
              Löschen
            </Button>
          </Stack>
        ))
      )}
    </Container>
  );
}
