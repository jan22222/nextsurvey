'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import SC from '@/components/SurveysComponent';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  setDoc, 
  query, 
  where 
} from 'firebase/firestore';
import useAuthStore from '@/store/authStore';

export default function Editor() {
  const { user } = useAuthStore();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Nur Umfragen laden, die der eingeloggte User erstellt hat
    const colRef = collection(db, 'surveys');
    const q = query(colRef, where('creatorId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
      creatorId: user.uid,
      creatorEmail: user.email || '',
      creatorName: user.displayName || '',
      createdAt: new Date(),
    });
    console.log('Survey erstellt');
  };

  const deleteSurvey = async (id) => {
    const survey = surveys.find((s) => s.id === id);
    if (!survey || survey.creatorId !== user.uid) {
      console.warn('Keine Berechtigung zum Löschen dieser Umfrage');
      return;
    }
    await deleteDoc(doc(db, 'surveys', id));
  };

  const updateSurvey = async (updatedSurvey) => {
    if (updatedSurvey.creatorId !== user.uid) {
      console.warn('Keine Berechtigung zum Bearbeiten dieser Umfrage');
      return;
    }
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
