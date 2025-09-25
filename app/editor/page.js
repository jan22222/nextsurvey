'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, setDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import SC from '@/components/SurveysComponent'; // dein Table-Component
import { db } from '@/lib/firebase'; // Firebase config
import useAuthStore from '@/store/authStore'; // Zustand Store

export default function Editor() {
  const { user, loading, initAuth } = useAuthStore();
  const [surveys, setSurveys] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(true);

  // Auth Listener starten
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Firestore abonnieren
  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, user.uid);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSurveys(data);
      setLoadingSurveys(false);
    });
    return () => unsubscribe();
  }, [user]);

  const createSurvey = async (values) => {
    if (!user) return;
    await addDoc(collection(db, user.uid), { title: values.title });
  };

  const deleteSurvey = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, user.uid, id));
  };

  const updateSurvey = async (updatedSurvey) => {
    if (!user) return;
    await setDoc(doc(db, user.uid, updatedSurvey.id), updatedSurvey);
  };

  if (loading || loadingSurveys) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: 20 }}>
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
