import React, { ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../src/store/Store';
import { format } from 'date-fns';
import {
  Box,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  TableBody,
  IconButton,
  Chip,
  Stack,
  Avatar,
  Tooltip,
  TextField,
  Pagination,
  useTheme,
  Grid,
  Button,
} from '@mui/material';
import { fetchTickets, DeleteTicket, SearchTicket } from '../../src/store/apps/tickets/TicketSlice';
import { IconTrash } from '@tabler/icons-react';
import { TicketType } from '../../src/types/apps/ticket';
import CustomNextPage from '../../types/custom';
import withRole from '../../src/components/hocs/withRole';
import FullLayout from '../../src/layouts/full/FullLayout';
import { auth, db } from '../../config/firebase';
import { query,addDoc, collection, doc, getDoc, setDoc, updateDoc, where, getDocs, DocumentReference } from 'firebase/firestore';



const MyUploads: CustomNextPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [myUploads, setMyUploads] = useState<any[]>([]);
  const [courseNames, setCourseNames] = useState<string[]>([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');
  const [selectedCredits, setSelectedCredits] = useState<number>(0);
 

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  useEffect(() => {
    const getUserMyUploads = async () => {
      const user = auth.currentUser;
      if (user) {
        const email = user.email;
        const q = query(collection(db, 'Users'), where('Email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userId = userDoc.id;
          const userData = userDoc.data();
          const myUploads = userData.MyUploads || [];
          setMyUploads(myUploads);
        }
      }
    };
  
    getUserMyUploads();
  }, []);
  
  

  const getCourseNameFromDocument = async (documentRef: any) => {
    const firestoreRef = doc(db, 'Syllabi', documentRef);
    const docSnapshot = await getDoc(firestoreRef);
    if (docSnapshot.exists()) {
      const docData = docSnapshot.data() as { CourseName: string } | undefined;
      return docData?.CourseName || '';
    }
    return '';
  };
 
  

  useEffect(() => {
    const fetchCourseNames = async () => {
      const names = await Promise.all(myUploads.map(getCourseNameFromDocument));
      setCourseNames(names);
    };
  
    fetchCourseNames();
  }, [myUploads]);


  
  const getVisibleTickets = (tickets: TicketType[], filter: string, ticketSearch: string) => {
    switch (filter) {
      case 'total_tickets':
        return tickets.filter(
          (c) => !c.deleted && c.ticketTitle.toLocaleLowerCase().includes(ticketSearch),
        );

      case 'Pending':
        return tickets.filter(
          (c) =>
            !c.deleted &&
            c.Status === 'Pending' &&
            c.ticketTitle.toLocaleLowerCase().includes(ticketSearch),
        );

      case 'Closed':
        return tickets.filter(
          (c) =>
            !c.deleted &&
            c.Status === 'Closed' &&
            c.ticketTitle.toLocaleLowerCase().includes(ticketSearch),
        );

      case 'Open':
        return tickets.filter(
          (c) =>
            !c.deleted &&
            c.Status === 'Open' &&
            c.ticketTitle.toLocaleLowerCase().includes(ticketSearch),
        );

      default:
        throw new Error(`Unknown filter: ${filter}`);
    }
  };

  const tickets = useSelector((state) =>
    getVisibleTickets(
      state.ticketReducer.tickets,
      state.ticketReducer.currentFilter,
      state.ticketReducer.ticketSearch,
    ),
  );
  

  return (
    <Box mt={4}>
       
      <Box sx={{ maxWidth: '260px', ml: 'auto' }} mb={3}>
        <TextField
          size="small"
          label="Search"
          fullWidth
          onChange={(e) => dispatch(SearchTicket(e.target.value))}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6">Id</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">Syllabus Name</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">Date</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {myUploads.map((upload, index) => (
    <TableRow key={upload}>
      <TableCell>
        <Typography variant="h6" fontWeight={600} noWrap>
          {index}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="h6" fontWeight={600} noWrap>
          {courseNames[index]}
        </Typography>
      </TableCell>
    </TableRow>
  ))}
</TableBody>


        </Table>
      </TableContainer>
      <Box my={3} display="flex" justifyContent={'center'}>
        <Pagination count={10} color="primary" />
      </Box>
    </Box>
  );
};

MyUploads.getLayout = function getLayout(page: ReactElement) {
  return <FullLayout>{page}</FullLayout>;
};

export default withRole({ Component: MyUploads, roles: ['Student', 'Faculty', 'Transfer Specialist'] });
