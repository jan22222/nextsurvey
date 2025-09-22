'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useRouter } from 'next/navigation';

const SurveyTable = ({ data, user, deleteSurvey, updateSurvey, createSurvey }) => {
  const router = useRouter();
  const [tableData, setTableData] = useState(data || []);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setTableData(data || []);
  }, [data]);

  const handleCreateNewRow = (values) => {
    createSurvey(values);
    setCreateModalOpen(false);
  };

  const handleSaveRowEdits = ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      tableData[row.index] = values;
      updateSurvey(values);
      exitEditingMode();
    }
  };

  const handleDeleteRow = (row) => {
    deleteSurvey(tableData[row.index].id);
  };

  const getCommonEditTextFieldProps = useCallback(
    (cell) => ({
      error: !!validationErrors[cell.id],
      helperText: validationErrors[cell.id],
      onBlur: (event) => {
        const isValid = validateRequired(event.target.value);
        if (!isValid) {
          setValidationErrors({
            ...validationErrors,
            [cell.id]: `${cell.column.columnDef.header} is required`,
          });
        } else {
          delete validationErrors[cell.id];
          setValidationErrors({ ...validationErrors });
        }
      },
    }),
    [validationErrors]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableEditing: false,
        enableSorting: false,
      },
      {
        accessorKey: 'title',
        header: 'Titel',
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
        }),
      },
    ],
    [getCommonEditTextFieldProps]
  );

  return (
    <>
      <MaterialReactTable
        columns={columns}
        data={tableData}
        editingMode="modal"
        enableColumnOrdering
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        renderRowActions={({ row }) => (
          <Box sx={{ display: 'flex', gap: '0.5rem' }}>
            <Tooltip title="Editieren">
              <IconButton onClick={() => row.table.setEditingRow(row)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Löschen">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fragen ansehen">
              <IconButton onClick={() => router.push(`/editor/${tableData[row.index].id}`)}>
                <ArrowForwardIosIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Abstimmung">
              <Button
                size="small"
                onClick={() => router.push(`/vote/${user.uid}/${tableData[row.index].id}`)}
              >
                Abstimmung
              </Button>
            </Tooltip>
            <Tooltip title="Ergebnisse">
              <Button
                size="small"
                onClick={() => router.push(`/summary/${user.uid}/${tableData[row.index].id}`)}
              >
                Ergebnisse
              </Button>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Button color="secondary" variant="contained" onClick={() => setCreateModalOpen(true)}>
            Neue Umfrage erstellen
          </Button>
        )}
      />

      <CreateSurveyModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateNewRow}
      />
    </>
  );
};

// Modal für neue Umfrage
const CreateSurveyModal = ({ open, columns, onClose, onSubmit }) => {
  const [values, setValues] = useState(
    columns.reduce((acc, column) => {
      if (column.accessorKey !== 'id') acc[column.accessorKey] = '';
      return acc;
    }, {})
  );

  const handleSubmit = () => {
    onSubmit(values);
    setValues({});
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle textAlign="center">Neue Umfrage erstellen</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {columns.map((column) => {
            if (column.accessorKey !== 'id') {
              return (
                <TextField
                  key={column.accessorKey}
                  label={column.header}
                  value={values[column.accessorKey] || ''}
                  onChange={(e) => setValues({ ...values, [column.accessorKey]: e.target.value })}
                />
              );
            }
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button color="secondary" variant="contained" onClick={handleSubmit}>
          Neue Umfrage erstellen
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const validateRequired = (value) => !!value.length;

export default SurveyTable;
