'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import SC from '@/components/SurveysComponent';
import { collection, addDoc, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import useAuthStore from '@/store/authStore';

export default function Editor() {
  const { user } = useAuthStore();
  const [currentSurvey, setCurrentSurvey] = useState({ id: null, title: '' });
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const colRef = collection(db, 'surveys');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSurveys(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const createSurvey = async (values) => {
    if (!user) return;

    const colRef = collection(db, 'surveys');
    await addDoc(colRef, {
      title: values.title,
      creator: user.email || user.uid, // Creator wird gespeichert
      createdAt: new Date(),
    });
    console.log('Survey erstellt');
  };

  const deleteSurvey = async (id) => {
    await deleteDoc(doc(db, 'surveys', id));
  };

  const updateSurvey = async (updatedSurvey) => {
    const docRef = doc(db, 'surveys', updatedSurvey.id);
    await setDoc(docRef, updatedSurvey, { merge: true });
  };

  if (!user) return <p>Bitte einloggen, um Umfragen zu erstellen.</p>;
  if (loading) return <p>Lade Umfragen...</p>;

  return (
    <SC
      user={user}
      data={surveys}
      createSurvey={createSurvey}
      deleteSurvey={deleteSurvey}
      updateSurvey={updateSurvey}
    />
  );
}
