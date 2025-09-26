"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, setDoc, doc, deleteDoc, onSnapshot } from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import SC from "@/components/SurveysComponent"; // dein Table-Component
import { db } from "@/lib/firebase";
import useAuthStore from "@/store/authStore";

export default function Editor() {
  const { user } = useAuthStore();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  const createSurvey = async (values) => {
    if (!user) return;

    const ref = collection(db, "surveys");
    await setDoc(doc(db, "surveys", surveyId), {
      title: surveyTitle,
      creatorId: user.uid,
      creatorEmail: user.email,
      creatorName: user.displayName || "",
    });

  };

  const deleteSurvey = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "surveys", id));
  };

  const updateSurvey = async (updatedSurvey) => {
    if (!user) return;
    const docRef = doc(db, "surveys", updatedSurvey.id);
    await setDoc(docRef, updatedSurvey, { merge: true });
  };

  useEffect(() => {
    if (!user) return;

    const colRef = collection(db, "surveys");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const newSurveys = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSurveys(newSurveys);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
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
