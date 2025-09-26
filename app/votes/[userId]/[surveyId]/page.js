'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  setDoc,
} from 'firebase/firestore';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import useAuthStore from '@/store/authStore';

export default function VotePage() {
  const { surveyId } = useParams();
  const { user } = useAuthStore();
  const [creatorData, setCreatorData] = useState(null); 
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSurvey = async () => {
      if (!user) return;

      // Prüfen, ob schon abgestimmt
      const participantRef = doc(db, 'surveys', surveyId, 'participants', user.email || user.uid);
      const participantSnap = await getDoc(participantRef);
      if (participantSnap.exists()) setAlreadyVoted(true);

      // Survey laden
      const surveyDoc = await getDoc(doc(db, 'surveys', surveyId));
      if (surveyDoc.exists()) setSurvey(surveyDoc.data());

      // Fragen laden
      const qSnap = await getDocs(collection(db, 'surveys', surveyId, 'questions'));
      const qs = [];
      for (let q of qSnap.docs) {
        const answersSnap = await getDocs(
          collection(db, 'surveys', surveyId, 'questions', q.id, 'answers')
        );
        qs.push({
          id: q.id,
          text: q.data().text,
          answers: answersSnap.docs.map((a) => ({ id: a.id, ...a.data() })),
        });
      }
      setQuestions(qs);
      setLoading(false);
    };

    loadSurvey();
  }, [surveyId, user]);

  const handleSubmitAll = async () => {
    if (!user) return alert('Bitte einloggen, um abzustimmen');
    if (alreadyVoted) return alert('Du hast bereits abgestimmt.');

    // Prüfen, ob alle Fragen beantwortet wurden
    if (Object.keys(selectedAnswers).length !== questions.length) {
      return alert('Bitte alle Fragen beantworten!');
    }

    try {
      // Alle Votes hochzählen
      for (const q of questions) {
        const answerId = selectedAnswers[q.id];
        const answerRef = doc(db, 'surveys', surveyId, 'questions', q.id, 'answers', answerId);
        await updateDoc(answerRef, { votes: increment(1) });
      }

      // Teilnehmer eintragen
      const participantRef = doc(db, 'surveys', surveyId, 'participants', user.email || user.uid);
      await setDoc(participantRef, { joinedAt: new Date() }, { merge: true });

      setAlreadyVoted(true);
      alert('Deine Stimme wurde gezählt! Vielen Dank.');
    } catch (err) {
      console.error(err);
      alert('Fehler beim Absenden');
    }

  };

  if (loading) return <p>Lade Umfrage...</p>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        {survey?.title}
      </Typography>

      {alreadyVoted && (
        <Alert severity="info" sx={{ mb: 4 }}>
          Du hast bereits abgestimmt. Vielen Dank!
        </Alert>
      )}

      {questions.map((q) => (
        <Stack key={q.id} mb={4}>
          <Typography variant="h6" gutterBottom>
            {q.text}
          </Typography>

          <RadioGroup
            value={selectedAnswers[q.id] || ''}
            onChange={(e) =>
              setSelectedAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
            }
          >
            {q.answers.map((a) => (
              <FormControlLabel
                key={a.id}
                value={a.id}
                control={<Radio />}
                label={a.text}
                disabled={alreadyVoted}
              />
            ))}
          </RadioGroup>
        </Stack>
      ))}

      {/* Button am Ende */}
      {!alreadyVoted && questions.length > 0 && (
        <Button variant="contained" color="primary" onClick={handleSubmitAll}>
          Abstimmung abschließen
        </Button>
      )}
    </Container>
  );
}
