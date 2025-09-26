'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import useAuthStore from '@/store/authStore';
import SC from '@/components/SurveysComponent';

export default function EditorPage() {
  const { user } = useAuthStore();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  const createSurvey = async (values) => {
    const ref = collection(db, 'surveys');
    const docRef = await addDoc(ref, {
      title: values.title,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  };

  const deleteSurvey = async (surveyId) => {
    await deleteDoc(doc(db, 'surveys', surveyId));
  };

  const updateSurvey = async (survey) => {
    const docRef = doc(db, 'surveys', survey.id);
    await setDoc(docRef, { title: survey.title }, { merge: true });
  };

  useEffect(() => {
    if (!user) return;
    const qRef = collection(db, 'surveys');
    const unsub = onSnapshot(qRef, (snapshot) => {
      const data = snapshot.docs
        .filter(doc => doc.data().ownerId === user.uid)
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setSurveys(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  return (
    <>
      <SC
        user={user}
        data={surveys}
        createSurvey={createSurvey}
        deleteSurvey={deleteSurvey}
        updateSurvey={updateSurvey}
      />
    </>
  );
}
