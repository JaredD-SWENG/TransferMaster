import { ReactElement, useEffect, useState } from "react";
import { DocumentReference, collection, getDoc, getDocs, updateDoc, doc, query, where, onSnapshot, QuerySnapshot, DocumentData, DocumentSnapshot } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, Typography, TableBody, Stack, Box, Chip, Button, Grid } from "@mui/material";
import CustomSelect from "../../../src/components/forms/theme-elements/CustomSelect";
import DashboardCard from "../../../src/components/shared/DashboardCard";
import { Timestamp } from "firebase/firestore";
import { auth } from '../../../config/firebase';
import CustomNextPage from "../../../types/custom";
import FullLayout from "../../../src/layouts/full/FullLayout";
import withRole from "../../../src/components/hocs/withRole";
import { useRouter } from "next/router";
import TCSFilter from "../../filterUI/TSCFilter";

interface Filter {
    value: string | null;
    type: string;
}

// db collection schemas

// Requests collection
interface RequestType {
    id: string;
    Requester: DocumentReference;
    Reviewer: string;
    ExternalSyllabus: DocumentReference;
    Status: string;
    Date: string;
}

interface RequestDisplayType {
    id: string;
    Requester: string;
    Reviewer: string;
    ExternalSyllabus: string; // name of syllabus should be displayed as a string
    CourseCategory: string;
    Status: string;
    Date: string;
}

// Users collection - only reviewers
interface FacultyType {
    id: string;
    name: string;
    department: string;
    syllabus: string[];
}

const TransferSpecialistDashboard: CustomNextPage = () => {
    const [requests, setRequests] = useState<RequestDisplayType[]>([]);
    const [selectedFaculty, setSelectedFaculty] = useState<{ [key: string]: string | '' }>({});
    const [faculty, setFaculty] = useState<FacultyType[]>([]);
    const router = useRouter();

    //view more details about the request such as comments
    const viewMoreDetails = (requestID: string) => {
        router.push({
        pathname: "/dashboards/transfer-specialist/RequestDetails",
        query: { requestID },
        });
    };
  

    useEffect(() => {

        // Pull requests to be displayed from /Requests collection
        const fetchRequests = async () => {
            const requestsCollection = collection(db, "Requests");
        
            const unsubscribe = onSnapshot(requestsCollection, (querySnapshot) => {
                const fetchedRequests: RequestDisplayType[] = [];
        
                querySnapshot.forEach(async (doc) => {
                    const requestData = doc.data() as RequestType;
        
                    // Convert the 'Date' object to a readable format
                    const timestamp = requestData.Date as unknown as Timestamp;
                    const date = timestamp.toDate().toLocaleDateString();
        
                    // Fetch the ExternalSyllabus document
                    const syllabusSnapshot = await getDoc(requestData.ExternalSyllabus);
                    const syllabusData = syllabusSnapshot.data()?.CourseName;
                    const syllabusCategory = syllabusSnapshot.data()?.CourseCategory;
        
                    // Fetch the Requester document
                    const requesterSnapshot = await getDoc(requestData.Requester);
                    const requesterData = requesterSnapshot.data()?.Name;

                    const reviewerId = requestData.Reviewer;
        
                    fetchedRequests.push({
                        id: doc.id,
                        Requester: requesterData,
                        Reviewer: reviewerId,
                        ExternalSyllabus: syllabusData,
                        CourseCategory: syllabusCategory,
                        Status: requestData.Status,
                        Date: date,
                    });
        
                    setRequests(fetchedRequests);
                });
            });
        
            // Clean up the listener when the component unmounts
            return unsubscribe;
        };
    

        // Pull reviewers to be displayed from /Users collection
        const fetchFaculty = async () => {
            const usersCollection = collection(db, "Users");
            const querySnapshot = await getDocs(usersCollection);
            const facultyData: FacultyType[] = [];

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.Role === "Faculty") {
                    facultyData.push({
                        id: doc.id,
                        name: userData.Name,
                        department: userData.Department,
                        syllabus: [],
                    });
                }
            });

            setFaculty(facultyData);
        };

        fetchRequests();
        fetchFaculty();
    }, []);


    // handle the assignment feature
    const handleAssign = (requestId: string) => async (event: React.ChangeEvent<{ value: unknown }>) => {
  
        // Fetch the document ID of the selected reviewer from the Users collection
        const reviewerName = event.target.value as string;
        const usersCollection = collection(db, "Users");
        const querySnapshot = await getDocs(query(usersCollection, where("Name", "==", reviewerName)));

        setSelectedFaculty({
            ...selectedFaculty,
            [requestId]: reviewerName,
        });

        if (!querySnapshot.empty) {
            let reviewerDocId = null;

            // Find the matching reviewer and retrieve their document ID
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.Name === reviewerName) {
                    reviewerDocId = doc.id;
                    return;
                }
            });

            if (reviewerDocId) {
                // Update the "Reviewer" field of the selected request in the database with the reviewer document ID
                const requestRef = doc(db, "Requests", requestId);
                try {
                    await updateDoc(requestRef, { Reviewer: reviewerDocId });
                    console.log("Update successful");
                } catch (error) {
                    console.error("Update failed:", error);
                }
            }
        }
    };


    // function handleClick() {
    //   return (
    //       router.push('../../comparison/')
    //   );
    // };
  

    console.log("Requests:", requests);
    console.log(faculty);


    const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);


    const handleSelect = async (value: Filter | null) => {

        console.log(value);
        let querySnapshot: QuerySnapshot<DocumentData> | undefined;
    
        if (value !== null) {
            if (value.value === null) {
                const fetchRequests = async () => {
                    const requestsCollection = collection(db, "Requests");
                
                    const unsubscribe = onSnapshot(requestsCollection, (querySnapshot) => {
                        const fetchedRequests: RequestDisplayType[] = [];
    
                        querySnapshot.forEach(async (doc) => {
                            const requestData = doc.data() as RequestType;
    
                            // Convert the 'Date' object to a readable format
                            const timestamp = requestData.Date as unknown as Timestamp;
                            const date = timestamp.toDate().toLocaleDateString();
    
                            // Fetch the ExternalSyllabus document
                            const syllabusSnapshot = await getDoc(requestData.ExternalSyllabus);
                            const syllabusData = syllabusSnapshot.data()?.CourseName;
                            const syllabusCategory = syllabusSnapshot.data()?.CourseCategory;
    
                            // Fetch the Requester document
                            const requesterSnapshot = await getDoc(requestData.Requester);
                            const requesterData = requesterSnapshot.data()?.Name;

                            const reviewerId = requestData.Reviewer;
                
                            fetchedRequests.push({
                                id: doc.id,
                                Requester: requesterData,
                                Reviewer: reviewerId,
                                ExternalSyllabus: syllabusData,
                                CourseCategory: syllabusCategory,
                                Status: requestData.Status,
                                Date: date,
                            });
    
                            setRequests(fetchedRequests);
                        });
                    });
                
                    // Clean up the listener when the component unmounts
                    return unsubscribe;
                };
            
                fetchRequests();
            }
            if (value.type == 'category') {
                const newRequests: RequestDisplayType[] = [];

                requests.forEach((request) => {
                    if (request.CourseCategory === value.value) {
                        newRequests.push(request);
                    }
                });

                setRequests(newRequests);
            }
            else if (value.type == 'review-status') {
                const newRequests: RequestDisplayType[] = [];

                requests.forEach((request) => {
                    if (request.Status === value.value) {
                        newRequests.push(request);
                    }
                });

                setRequests(newRequests);
            }
            else if (value.type == 'faculty') {
                const newRequests: RequestDisplayType[] = [];
                let facultyId: string;

                faculty.forEach((facultyMember) => {
                    if (facultyMember.name === value.value) {
                        facultyId = facultyMember.id;
                    }
                });

                requests.forEach((request) => {
                    if (request.Reviewer === facultyId) {
                        newRequests.push(request);
                    }
                });

                setRequests(newRequests);
            }
            else if (value.type === 'date') {
                if (value.value !== null) {
                    let noOfDays: number = parseInt(value.value[5]);
                    if (parseInt(value.value[6]) !== null) {
                        noOfDays *= 10;
                        noOfDays += parseInt(value.value[6]);
                    }
                    console.log(noOfDays);
                    let date = new Date();
                    date.setDate(date.getDate() - noOfDays);

                    console.log(date.toLocaleDateString());

                    const newRequests: RequestDisplayType[] = [];

                    requests.forEach((request) => {
                        if (request.Date >= date.toLocaleDateString()) {
                            newRequests.push(request);
                        }
                    });

                    setRequests(newRequests); 
                }
            }
    
            if (querySnapshot) {
                const fetchedRequests: RequestDisplayType[] = [];
    
                // Change to for...of loop to handle async operation
                for (const doc of querySnapshot.docs) {
                    const requestData = doc.data() as RequestType;
        
                    // Convert the 'Date' object to a readable format
                    const timestamp = requestData.Date as unknown as Timestamp;
                    const date = timestamp.toDate().toLocaleDateString();
        
                    // Fetch the ExternalSyllabus document
                    const syllabusSnapshot = await getDoc(requestData.ExternalSyllabus);
                    const syllabusData = syllabusSnapshot.data()?.CourseName;
                    const syllabusCategory = syllabusSnapshot.data()?.CourseCategory;
        
                    // Fetch the Requester document
                    const requesterSnapshot = await getDoc(requestData.Requester);
                    const requesterData = requesterSnapshot.data()?.Name;

                    const reviewerId = requestData.Reviewer;
        
                    fetchedRequests.push({
                        id: doc.id,
                        Requester: requesterData,
                        Reviewer: reviewerId,
                        ExternalSyllabus: syllabusData,
                        CourseCategory: syllabusCategory,
                        Status: requestData.Status,
                        Date: date,
                    });
                }
    
                setRequests(fetchedRequests);
            }
        }
    };
    


    return (
        <DashboardCard
            title="Requests"
            action={
                <Grid>               
                    <TCSFilter onSelect={handleSelect} /> 
                </Grid>
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
                                <Typography variant="subtitle2" fontWeight={600}>Course Category</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>Assigned</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>Status</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight={600}>Date</Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {request.Requester}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                                        {request.ExternalSyllabus}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                                        {request.CourseCategory}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <CustomSelect
                                        value={selectedFaculty[request.id] || ''}
                                        onChange={handleAssign(request.id)}
                                        size="small"
                                    >
                                        {faculty.map((facultyMember) => (
                                            <MenuItem key={facultyMember.id} value={facultyMember.name}>
                                                {facultyMember.name}
                                            </MenuItem>
                                        ))}
                                    </CustomSelect>
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
                                                ? (theme) => theme.palette.error.light
                                                : (theme) => theme.palette.secondary.light,
                                            color:    
                                                request.Status === 'To-do'
                                                ? (theme) => theme.palette.error.main
                                                : request.Status === 'In progress'
                                                ? (theme) => theme.palette.warning.main
                                                : request.Status === 'Approved'
                                                ? (theme) => theme.palette.success.main
                                                : request.Status === 'Rejected'
                                                ? (theme) => theme.palette.error.main
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
                                    <Button variant="outlined" onClick={() => viewMoreDetails(request.id)} >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </DashboardCard>
    );
};

TransferSpecialistDashboard.getLayout = function getLayout(page: ReactElement) {
    return <FullLayout>{page}</FullLayout>;
};

export default withRole({ Component: TransferSpecialistDashboard, roles: ['Transfer Specialist'] });