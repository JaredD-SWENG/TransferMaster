import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  TableBody,
  Stack,
  Chip,
  Box,
  Button,
  Grid,
} from "@mui/material";
import DashboardCard from "../../../src/components/shared/DashboardCard";
import { ReactElement, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../../config/firebase";
import {
  DocumentData,
  DocumentReference,
  QuerySnapshot,
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import CustomNextPage from "../../../types/custom";
import FullLayout from "../../../src/layouts/full/FullLayout";
import withRole from "../../../src/components/hocs/withRole";
import FacultyFilter from "../../filterUI/FacultyFilter";
import HoverButton from "../../ui-components/HoverButton";

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
  CourseCategory: string;
  ExternalSyllabusPath: string;
  Status: string;
  Date: string;
}

const FacultyDashboard: CustomNextPage = () => {
  const [requests, setRequests] = useState<RequestDisplayType[]>([]);
  const [userID, setUserID] = useState<string | undefined>();
  const router = useRouter();

  const handleClick = (
    requestID: string,
    externalSyllabus: string,
    userID: string | undefined
  ) => {
    console.log(externalSyllabus);
    console.log("userID", userID);
    router.push({
      pathname: "../../comparison",
      query: { requestID, externalSyllabus, userID },
    });
  };

  useEffect(() => {
    const fetchRequests = async () => {
      const currentUser = auth.currentUser;
      let userId = null;
      if (currentUser !== null) {
        const email = currentUser.email;
        const q = query(collection(db, "Users"), where("Email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          userId = userDoc.id;
          setUserID(userId);
          console.log(userId);
        }
      }
      const requestsCollection = collection(db, "Requests");
      const findMe = "/Users/" + userId;
      console.log("findMe", findMe);
      const querySnapshot = await getDocs(
        query(
          requestsCollection,
          where("Reviewer", "==", userId ? doc(db, "Users", userId) : null)
        )
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
        const syllabusName = syllabusSnapshot.data()?.CourseName;
        const syllabusCategory = syllabusSnapshot.data()?.CourseCategory;

        // Fetch the Requester document
        const requesterSnapshot = await getDoc(requestData.Requester);
        const requesterData = requesterSnapshot.data()?.Name;

        fetchedRequests.push({
          id: doc.id,
          Requester: requesterData,
          ExternalSyllabus: syllabusName,
          CourseCategory: syllabusCategory,
          ExternalSyllabusPath: externalSyllabusPath,
          Status: requestData.Status,
          Date: date,
        });
      }

      setRequests(fetchedRequests);
    };

    fetchRequests();
  }, []); // <-- Empty dependency array

  interface Filter {
    value: string | null;
    type: string;
  }

  console.log("Requests:", requests);

  const handleSelect = async (value: Filter | null) => {
    console.log(value);
    if (value !== null) {
      if (value.value === null) {
        const fetchRequests = async () => {
          const currentUser = auth.currentUser;
          let userId = null;
          if (currentUser !== null) {
            const email = currentUser.email;
            const q = query(
              collection(db, "Users"),
              where("Email", "==", email)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              userId = userDoc.id;
              setUserID(userId);
              console.log(userId);
            }
          }
          const requestsCollection = collection(db, "Requests");
          const findMe = "/Users/" + userId;
          console.log("findMe", findMe);
          const querySnapshot = await getDocs(
            query(
              requestsCollection,
              where("Reviewer", "==", userId ? doc(db, "Users", userId) : null)
            )
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
            const syllabusName = syllabusSnapshot.data()?.CourseName;
            const syllabusCategory = syllabusSnapshot.data()?.CourseCategory;

            // Fetch the Requester document
            const requesterSnapshot = await getDoc(requestData.Requester);
            const requesterData = requesterSnapshot.data()?.Name;

            fetchedRequests.push({
              id: doc.id,
              Requester: requesterData,
              ExternalSyllabus: syllabusName,
              CourseCategory: syllabusCategory,
              ExternalSyllabusPath: externalSyllabusPath,
              Status: requestData.Status,
              Date: date,
            });
          }

          setRequests(fetchedRequests);
        };

        fetchRequests();
      } else {
        if (value.type == "category") {
          const newRequests: RequestDisplayType[] = [];
          requests.forEach((request) => {
            if (request.CourseCategory === value.value) {
              newRequests.push(request);
            }
          });
          setRequests(newRequests);
        } else if (value.type === "review-status") {
          const newRequests: RequestDisplayType[] = [];
          requests.forEach((request) => {
            if (request.Status === value.value) {
              newRequests.push(request);
            }
          });
          setRequests(newRequests);
        } else if (value.type === "date") {
          let noOfDays: number = parseInt(value.value[5]);
          if (!Number.isNaN(parseInt(value.value[6]))) {
            noOfDays *= 10;
            noOfDays += parseInt(value.value[6]);
          }
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
    }
  };

  return (
    <>
      {/* Use the HoverButton component here */}
      <HoverButton
        instructions="This is the dashboard for Faculty.
        You can see and review all requests that have been assigned to you."
      />
      <Grid>
        <FacultyFilter onSelect={handleSelect} />
      </Grid>
      <DashboardCard title="Requests">
        <TableContainer>
          <Table
            aria-label="simple table"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Requested by
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Syllabus
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Course Category
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
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map(
                (request: {
                  id: any;
                  Requester: any;
                  ExternalSyllabus: any;
                  CourseCategory: string;
                  Status: string;
                  Date: any;
                  ExternalSyllabusPath: string;
                }) => (
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
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        fontWeight={400}
                      >
                        {request.ExternalSyllabus}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        fontWeight={400}
                      >
                        {request.CourseCategory}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        sx={{
                          bgcolor:
                            request.Status === "Submitted"
                              ? (theme) => theme.palette.error.light
                              : request.Status === "In progress"
                              ? (theme) => theme.palette.warning.light
                              : request.Status === "Approved"
                              ? (theme) => theme.palette.success.light
                              : request.Status === "Rejected"
                              ? (theme) => theme.palette.error.light
                              : (theme) => theme.palette.secondary.light,
                          color:
                            request.Status === "Submitted"
                              ? (theme) => theme.palette.error.main
                              : request.Status === "In progress"
                              ? (theme) => theme.palette.warning.main
                              : request.Status === "Approved"
                              ? (theme) => theme.palette.success.main
                              : request.Status === "Rejected"
                              ? (theme) => theme.palette.error.main
                              : (theme) => theme.palette.secondary.main,
                          borderRadius: "8px",
                        }}
                        size="small"
                        label={request.Status}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        fontWeight={400}
                      >
                        {request.Date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          handleClick(
                            request.id,
                            request.ExternalSyllabusPath,
                            userID
                          )
                        }
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DashboardCard>
    </>
  );
};

FacultyDashboard.getLayout = function getLayout(page: ReactElement) {
  return <FullLayout>{page}</FullLayout>;
};
export default withRole({ Component: FacultyDashboard, roles: ["Faculty"] });
