'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import useAuthStore from '@/store/authStore';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function VotePage() {
    const params = useParams();
    const surveyId = params.surveyId;

  const { user } = useAuthStore();

  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!surveyId) return;

    const unsubSurvey = onSnapshot(doc(db, 'surveys', surveyId), (snap) => {
      if (snap.exists()) {
        setSurvey({ id: snap.id, ...snap.data() });
      }
    });

    const unsubQuestions = onSnapshot(
      collection(db, 'surveys', surveyId, 'questions'),
      (snap) => {
        const q = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setQuestions(q);
        setLoading(false);
      }
    );

    return () => {
      unsubSurvey();
      unsubQuestions();
    };
  }, [surveyId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (questionId) => {
    if (!user) {
      alert('Bitte einloggen, um abzustimmen.');
      return;
    }

    try {
      // Antwort in Subcollection speichern
      await addDoc(collection(db, 'surveys', surveyId, 'questions', questionId, 'answers'), {
        userId: user.uid,
        answer: answers[questionId],
        submittedAt: serverTimestamp(),
      });

      // Teilnahme registrieren
      const responseRef = doc(db, 'surveys', surveyId, 'responses', user.uid);
      await setDoc(
        responseRef,
        {
          userId: user.uid,
          userName: user.displayName || user.email || 'Anonym',
          hasVoted: true,
          submittedAt: serverTimestamp(),
          answers: {
            [questionId]: answers[questionId],
          },
        },
        { merge: true }
      );

      alert('Antwort gespeichert!');
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      alert('Fehler beim Speichern der Antwort');
    }
  };

  if (loading) return <p>Lade Umfrage…</p>;

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {survey?.title || 'Umfrage'}
      </Typography>

      <Slider {...sliderSettings}>
        {questions.map((q) => (
          <Box key={q.id} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              {q.text}
            </Typography>

            <RadioGroup
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            >
              {q.options?.map((opt, idx) => (
                <FormControlLabel
                  key={idx}
                  value={opt}
                  control={<Radio />}
                  label={opt}
                />
              ))}
            </RadioGroup>

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => handleSubmit(q.id)}
              disabled={!answers[q.id]}
            >
              Senden
            </Button>
          </Box>
        ))}
      </Slider>
    </Container>
  );
}
