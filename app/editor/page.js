'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, setDoc, doc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import SC from '@/components/SurveysComponent';
import { db } from '@/lib/firebase';
import useAuthStore from '@/store/authStore';

export default function Editor() {
  const { user, loading, initAuth } = useAuthStore();
  const [surveys, setSurveys] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'surveys');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((survey) => survey.ownerId === user.uid); // nur eigene anzeigen
      setSurveys(data);
      setLoadingSurveys(false);
    });
    return () => unsubscribe();
  }, [user]);

  const createSurvey = async (values) => {
    if (!user) return;
    const ref = collection(db, 'surveys');
    await addDoc(ref, {
      title: values.title,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const deleteSurvey = async (id) => {
    await deleteDoc(doc(db, 'surveys', id));
  };

  const updateSurvey = async (updatedSurvey) => {
    const docRef = doc(db, 'surveys', updatedSurvey.id);
    await setDoc(docRef, updatedSurvey, { merge: true });
  };

  if (loading || loadingSurveys) return <CircularProgress />;

  return (
    <Container>
      <SC
        user={user}
        data={surveys}
        createSurvey={createSurvey}
        deleteSurvey={deleteSurvey}
        updateSurvey={updateSurvey}
      />
    </Container>
  );
}
