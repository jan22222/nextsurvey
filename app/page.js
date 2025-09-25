'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

export default function HomePage() {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const loadSurveys = async () => {
      const snapshot = await getDocs(collection(db, 'surveys'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSurveys(data);
    };
    loadSurveys();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Verfügbare Umfragen
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Titel</TableCell>
            <TableCell>Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id}>
              <TableCell>{survey.title}</TableCell>
              <TableCell>
                <Link href={`/votes/${survey.id}`} passHref>
                  <Button variant="contained" color="primary">
                    Teilnehmen
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
