'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

export default function SummaryPage() {
  const { userId, surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const loadSummary = async () => {
      // Survey laden
      const surveyDoc = await getDoc(doc(db, 'surveys', surveyId));
      if (!surveyDoc.exists()) return;
      const surveyData = surveyDoc.data();
      setSurvey(surveyData);

      // Creator
      const creator = surveyData.creator || surveyData.userId || 'Unbekannt';

      // Teilnehmer laden
      const pSnap = await getDocs(collection(db, 'surveys', surveyId, 'participants'));
      let pList = pSnap.docs.map((d) => d.id);

      // Creator vorne hinzufügen, falls nicht schon enthalten
      if (!pList.includes(creator)) pList.unshift(creator);

      // Teilnehmer mit Hinweis, wer Creator ist
      const pListWithLabel = pList.map((p) => (p === creator ? `${p} (Creator)` : p));

      setParticipants(pListWithLabel);

      // Fragen + Antworten
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
    };

    loadSummary();
  }, [surveyId]);

  if (!survey) return <p>Lade Ergebnisse...</p>;

  return (
    <Container>
      {/* Überschrift */}
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Ergebnisse: {survey.title}
      </Typography>

      {/* Teilnehmer */}
      <Typography variant="h6" gutterBottom>
        Teilnehmer:
      </Typography>
      {participants.length > 0 ? (
        <Stack mb={4}>
          {participants.map((p) => (
            <Typography key={p}>• {p}</Typography>
          ))}
        </Stack>
      ) : (
        <Typography mb={4}>Noch keine Teilnehmer</Typography>
      )}

      {/* Fragen + Antworten */}
      {questions.map((q) => (
        <Stack key={q.id} mb={4}>
          <Typography variant="h6">Frage: {q.text}</Typography>
          {q.answers.map((a) => (
            <Typography key={a.id} sx={{ ml: 2 }}>
              Antwort: {a.text} → <strong>{a.votes || 0}</strong>
            </Typography>
          ))}
        </Stack>
      ))}
    </Container>
  );
}
