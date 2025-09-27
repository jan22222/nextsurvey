'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

export default function QuestionsEditor() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.surveyId;

  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [loading, setLoading] = useState(true);

  const questionsRef = collection(db, 'surveys', surveyId, 'questions');

  useEffect(() => {
    const unsub = onSnapshot(questionsRef, (snapshot) => {
      const qs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(qs);
      setLoading(false);
    });
    return () => unsub();
  }, [surveyId]);

  const addQuestion = async () => {
    if (!newQuestionText) return;
    await addDoc(questionsRef, {
      text: newQuestionText,
      options: [], // wird später im Antworten-Editor gefüllt
    });
    setNewQuestionText('');
  };

  const deleteQuestion = async (questionId) => {
    await deleteDoc(doc(db, 'surveys', surveyId, 'questions', questionId));
  };

  return (
    <Container>
      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="outlined" onClick={() => router.back()}>
          Zurück
        </Button>
        <Typography variant="h4" gutterBottom>
          Fragen
        </Typography>
      </Stack>

      <Stack spacing={2} mb={2}>
        <TextField
          label="Neue Frage"
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
        />
        <Button variant="contained" onClick={addQuestion}>Hinzufügen</Button>
      </Stack>

      {loading ? <p>Lade Fragen...</p> : (
        questions.map(q => (
          <Stack key={q.id} direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" mb={1}>
            <Typography sx={{ flexGrow: 1 }}>{q.text}</Typography>

            {/* Link zu Antworten */}
            <Button
              variant="outlined"
              href={`/editor/${surveyId}/questions/${q.id}/answers`}
            >
              Antworten bearbeiten
            </Button>

            <Button color="error" onClick={() => deleteQuestion(q.id)}>
              Löschen
            </Button>
          </Stack>
        ))
      )}
    </Container>
  );
}
