import { MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, Typography, TableBody, Stack, Avatar, Chip, Box, Card, Button, Grid } from "@mui/material"
import CustomSelect from "../../../src/components/forms/theme-elements/CustomSelect"
import DashboardCard from "../../../src/components/shared/DashboardCard"
import { Key, ReactElement, JSXElementConstructor, ReactFragment, ReactPortal, useState, useEffect } from "react";
import { Router, useRouter } from "next/router";
import { auth, db } from "../../../config/firebase";
import { DocumentReference, Timestamp, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
//Requests collection
interface RequestType {
  id: string;
  Requester: DocumentReference;
  ExternalSyllabus: DocumentReference;
  ExternalSyllabusPath: string;
  Status: string;
  Date: string;
}

interface RequestDisplayType {
  id: string;
  Requester: string;
  ExternalSyllabus: string; //name of syllabus should be displayed as a string
  ExternalSyllabusPath: string;
  Status: string;
  Date: string;
}

const FacultyDashboard = () => {
  const [requests, setRequests] = useState<RequestDisplayType[]>([]);

    const router = useRouter();
    
    const handleClick = (externalSyllabus: string) => {
      console.log(externalSyllabus)
      router.push({
        pathname: "../../comparison/SyllabusComparison",
        query: { externalSyllabus },
        
      });
    };

    //are we using this?
    const handleUploadHistoryClick = () => {
        router.push('../myUploads')}

        useEffect(() => {
          const fetchRequests = async () => {
              const currentUser = auth.currentUser;
              let userId = null;
              if (currentUser !== null) {
                  const email = currentUser.email;
                  const q = query(collection(db, 'Users'), where('Email', '==', email));
                  const querySnapshot = await getDocs(q);
  
                  if (!querySnapshot.empty) {
                      const userDoc = querySnapshot.docs[0];
                      userId = userDoc.id;
                      console.log(userId)
                  }
              }
              const requestsCollection = collection(db, 'Requests');
              const querySnapshot = await getDocs(
                  query(requestsCollection, where('Reviewer', '==', userId))
              );
  
              const fetchedRequests: RequestDisplayType[] = [];
  
              for (const doc of querySnapshot.docs) {
                  const requestData = doc.data() as RequestType;
  
                  // Convert the 'Date' object to a readable format
                  const timestamp = requestData.Date as unknown as Timestamp;
                  const date = timestamp.toDate().toLocaleDateString();
  
                  // Fetch the ExternalSyllabus document
                  const syllabusSnapshot = await getDoc(requestData.ExternalSyllabus);
                  console.log(requestData.ExternalSyllabus.path);
                  const externalSyllabusPath = requestData.ExternalSyllabus.path;
                  const syllabusData = syllabusSnapshot.data()?.CourseName;
  
                  // Fetch the Requester document
                  const requesterSnapshot = await getDoc(requestData.Requester);
                  const requesterData = requesterSnapshot.data()?.Name;
  
                  fetchedRequests.push({
                      id: doc.id,
                      Requester: requesterData,
                      ExternalSyllabus: syllabusData,
                      ExternalSyllabusPath: externalSyllabusPath,
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
            <Button variant="contained" color="primary" onClick={handleUploadHistoryClick}>My Uploads</Button>
            <Button onClick={callLambdaFunction}>Call Lambda Function</Button>
        </Grid>
        <DashboardCard
            title="Requests"
            action={
                <CustomSelect
                    labelId="month-dd"
                    id="month-dd"
                    size="small"
                >
                    <MenuItem value={1}>March 2023</MenuItem>
                    <MenuItem value={2}>April 2023</MenuItem>
                    <MenuItem value={3}>May 2023</MenuItem>
                </CustomSelect>
            }
        >
            <TableContainer>
                <Table
                    aria-label="simple table"
                    sx={{
                        whiteSpace: 'nowrap',
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>Requested by</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>Syllabus</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>Status</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>Date</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>Actions</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>
                                    <Stack direction="row" spacing={2}>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {request.Requester}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
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
                                <TableCell>
                                    <Button variant="outlined" onClick={() => handleClick(request.ExternalSyllabusPath)}>
                                        Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </DashboardCard></>
    );
};

async function callLambdaFunction() {
    const response = await fetch('https://e5vsx4lon0.execute-api.us-east-1.amazonaws.com/prod', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        num1: 421,
        num2: 2
      })
    })
    const data = await response.json();
    console.log(data);
  }

export default FacultyDashboard;