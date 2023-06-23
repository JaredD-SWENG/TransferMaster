import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Typography,
  TableHead,
  Avatar,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
  TableFooter,
  IconButton,
  TableContainer,
  Button,
  Grid,
  MenuItem,
} from '@mui/material';

import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

import Breadcrumb from '../../../src/layouts/full/shared/breadcrumb/Breadcrumb';
import PageContainer from '../../../src/components/container/PageContainer';

import ParentCard from '../../../src/components/shared/ParentCard';
import { Stack } from '@mui/system';
import BlankCard from '../../../src/components/shared/BlankCard';
import { useRouter } from 'next/router';
import { DocumentReference, Timestamp, collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';
import DashboardCard from '../../../src/components/shared/DashboardCard';
import CustomSelect from '../../../src/components/forms/theme-elements/CustomSelect';
import { useEffect, useState } from 'react';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: any) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: any) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: any) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: any) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

// Requests collection
interface RequestType {
  id: string;
  Requester: DocumentReference;
  ExternalSyllabus: DocumentReference;
  Status: string;
  Date: string;
}

interface RequestDisplayType {
  id: string;
  Requester: string;
  ExternalSyllabus: string; // Name of syllabus should be displayed as a string
  Status: string;
  Date: string;
}

const StudentDashboard = () => {
  const [requests, setRequests] = useState<RequestDisplayType[]>([]);
  const router = useRouter();

  const handleSubmit = () => {
    router.push('../../comparison/UploadPage');
  };

  useEffect(() => {
    const fetchRequests = async () => {
      const currentUser = auth.currentUser;
      let userId = null;
      if (currentUser) {
        const email = currentUser.email;
        const q = query(collection(db, 'Users'), where('Email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          userId = userDoc.id;
        }
      }
      const requestsCollection = collection(db, 'Requests');
      const querySnapshot = await getDocs(
        query(requestsCollection, where('Requester', '==', userId ? doc(db, 'Users', userId) : null))
      );
      const fetchedRequests: RequestDisplayType[] = [];

      for (const doc of querySnapshot.docs) {
        const requestData = doc.data() as RequestType;

        // Convert the 'Date' object to a readable format
        const timestamp = requestData.Date as unknown as Timestamp;
        const date = timestamp.toDate().toLocaleDateString();

        // Fetch the ExternalSyllabus document
        const syllabusSnapshot = await getDoc(requestData.ExternalSyllabus);
        const syllabusData = syllabusSnapshot.data()?.CourseName;

        // Fetch the Requester document
        const requesterSnapshot = await getDoc(requestData.Requester);
        const requesterData = requesterSnapshot.data()?.Name;

        fetchedRequests.push({
          id: doc.id,
          Requester: requesterData,
          ExternalSyllabus: syllabusData,
          Status: requestData.Status,
          Date: date,
        });
      }

      setRequests(fetchedRequests);
    };

    fetchRequests();
  }, []); // <-- Empty dependency array

  return (
    <>
    <Grid item xs={12} mt={3} mb={3}>
    <Button variant="contained" color="primary" onClick={handleSubmit}>Submit new Request</Button>
    </Grid>
    <DashboardCard
      title="Requests"
      action={
        <CustomSelect labelId="month-dd" id="month-dd" size="small">
          <MenuItem value={1}>March 2023</MenuItem>
          <MenuItem value={2}>April 2023</MenuItem>
          <MenuItem value={3}>May 2023</MenuItem>
        </CustomSelect>
      }
    >
      <TableContainer>
        <Table aria-label="simple table" sx={{ whiteSpace: 'nowrap' }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Syllabus
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Status
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Date
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                    {request.ExternalSyllabus}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    sx={{
                      bgcolor:
                        request.Status === 'To-do'
                          ? (theme) => theme.palette.error.light
                          : request.Status === 'In progress'
                          ? (theme) => theme.palette.warning.light
                          : request.Status === 'Approved'
                          ? (theme) => theme.palette.success.light
                          : request.Status === 'Rejected'
                          ? (theme) => theme.palette.info.light
                          : (theme) => theme.palette.secondary.light,
                      color:
                        request.Status === 'To-do'
                          ? (theme) => theme.palette.error.main
                          : request.Status === 'In progress'
                          ? (theme) => theme.palette.warning.main
                          : request.Status === 'Approved'
                          ? (theme) => theme.palette.success.main
                          : request.Status === 'Rejected'
                          ? (theme) => theme.palette.info.main
                          : (theme) => theme.palette.secondary.main,
                      borderRadius: '8px',
                    }}
                    size="small"
                    label={request.Status}
                  />
                </TableCell>
                <TableCell>
                  <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                    {request.Date}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardCard></>
  );
};

export default StudentDashboard;

