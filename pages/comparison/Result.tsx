import PageContainer from "../../src/components/container/PageContainer";
import dynamic from "next/dynamic";
import React, { ReactElement, useEffect, useState } from 'react';
import {
    Button,
    Box,
    Dialog,
    DialogTitle,
    Slide,
    TextField,
    DialogContent,
    DialogActions,
    DialogContentText,
    Grid,
    Typography
} from '@mui/material';
import CustomFormLabel from '../../src/components/forms/theme-elements/CustomFormLabel';
import { TransitionProps } from '@mui/material/transitions';
import withRole from "../../src/components/hocs/withRole";
import FullLayout from "../../src/layouts/full/FullLayout";
import CustomNextPage from "../../types/custom";
import { useRouter } from "next/router";
import { getBytes, getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../../config/firebase";
import { DocumentReference, collection, getDoc, getDocs, updateDoc, doc, query, where, Timestamp } from "firebase/firestore";
import { getDocument, GlobalWorkerOptions} from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';

interface RequestDoc {
    Comments: string | null;
    Date: Timestamp;
    ExternalSyllabus: DocumentReference ;
    Grade: number;
    PSUSyllabus: DocumentReference;
    Requester: DocumentReference ;
    Reviewer: string ;
    Status: string;
  }
  
  interface SyllabusDoc {
    InstitutionName: string;
    CourseName: string;
    Credits: number;
    CourseCategory: string;
    TermType: string;
    SyllabusURL: DocumentReference;
  }
  
  interface SyllabusURLDoc {
    fileUrl: string;
  }

let extFullText = "";
let psuFullText = "";

const DynamicBarChart = dynamic(() => import('./BarChart'), { ssr: false });

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

let sliderValues: any;



//diplay comparison metrics like graph, summary, etc. 
const Result: CustomNextPage = () => {

    const router = useRouter();
sliderValues = JSON.parse(router.query.sliderValues as string);
const requestID = router.query.requestID as string;
const [learningObjectivePercentages, setLearningObjectivePercentages] = useState<number[] | null>(null);
const [message, setMessage] = useState('');
const [status, setStatus] = useState('');

async function callLambdaFunction() {
    const response = await fetch('https://e5vsx4lon0.execute-api.us-east-1.amazonaws.com/prod', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        psuText: psuFullText,
        extText: extFullText,
        weights: sliderValues,
      })
    })
    const data = await response.json();
    const temp = data.map((s: string) => parseFloat(s)*100);
    console.log(temp);
    setLearningObjectivePercentages(temp);
    console.log(learningObjectivePercentages);
  }
    useEffect(() => {
        async function fetchDocs() {
            let docRef = doc(db, 'Requests', requestID);
            try {
                const requestDocSnapshot = await getDoc(docRef);
                if (requestDocSnapshot.exists()) {
                    let requestDocData = requestDocSnapshot.data() as RequestDoc;
                    let extSyllabusRef = requestDocData.ExternalSyllabus;
                    let psuSyllabusRef = requestDocData.PSUSyllabus;

                    const extSyllabusDocSnapshot = await getDoc(extSyllabusRef);
                    if (extSyllabusDocSnapshot.exists()) {
                        let syllabusDocData = extSyllabusDocSnapshot.data() as SyllabusDoc;
                        let syllabusURLRef = syllabusDocData.SyllabusURL;

                        const syllabusURLDocSnapshot = await getDoc(syllabusURLRef);
                        if (syllabusURLDocSnapshot.exists()) {
                            let syllabusURLDocData = syllabusURLDocSnapshot.data() ;
                            let storageFileURL = syllabusURLDocData.fileUrl;

                            const fileRef = ref(storage, storageFileURL);
                            const fileBytes = await getBytes(fileRef);

                            const loadingTask = getDocument({ data: fileBytes });
                            const pdf = await loadingTask.promise;

                            loadingTask.promise
                            .then(async (pdf: { numPages: number; getPage: (arg0: number) => any }) => {
                              console.log('Promise resolved. PDF:', pdf);
                             
                              // Loop through each page and extract text
                              for (let i = 1; i <= pdf.numPages; i++) {
                                const page = await pdf.getPage(i);
                    
                                // Extract the text content
                                const content = await page.getTextContent();
                    
                                // Combine the text items into a single string
                                const text = content.items.map((item: { str: any }) => item.str).join(' ');
                    
                                extFullText += text + '\n';
                              }
                    
                              console.log('Ext PDF Text:', extFullText);
                            })

                           
                        }
                    }

                    const psuSyllabusDocSnapshot = await getDoc(psuSyllabusRef);
                    if (psuSyllabusDocSnapshot.exists()) {
                        let syllabusDocData = psuSyllabusDocSnapshot.data() as SyllabusDoc;
                        let syllabusURLRef = syllabusDocData.SyllabusURL;

                        const syllabusURLDocSnapshot = await getDoc(syllabusURLRef);
                        if (syllabusURLDocSnapshot.exists()) {
                            let syllabusURLDocData = syllabusURLDocSnapshot.data() as SyllabusURLDoc;
                            let storageFileURL = syllabusURLDocData.fileUrl;

                            const fileRef = ref(storage, storageFileURL);
                            const fileBytes = await getBytes(fileRef);

                            const loadingTask = getDocument({ data: fileBytes });
                            const pdf = await loadingTask.promise;

                            loadingTask.promise
                            .then(async (pdf: { numPages: number; getPage: (arg0: number) => any }) => {
                              console.log('Promise resolved. PDF:', pdf);
                             
                              // Loop through each page and extract text
                              for (let i = 1; i <= pdf.numPages; i++) {
                                const page = await pdf.getPage(i);
                    
                                // Extract the text content
                                const content = await page.getTextContent();
                    
                                // Combine the text items into a single string
                                const text = content.items.map((item: { str: any }) => item.str).join(' ');
                    
                                psuFullText += text + '\n';
                              }
                    
                              console.log('PSU PDF Text:', psuFullText);
                            })
                        }
                    }
                }
            } catch (error) {
                console.log('Error getting document:', error);
            }
        }
        fetchDocs();

        callLambdaFunction();
    }, []);

    
    const syllabusComponents : any = {
        score: 73.68,
        learningObjectives: {
            objectives: [
                'Want to sell your soul',
                'Learn calculus 2',
                'Cry many tears',
                'Fill out pieces of paper worth a small forest with problem questions or use up all your storage space'
            ],
            scores: learningObjectivePercentages,
            score: 30,
            summary: [
                'Soul was mentioned but it was probably "soul enriching" so nope',
                'There was learning and calculus so ::thumbs up::',
                'Crying was involved',
                'This essentially points to lots of practice work and there definitely is a lot of that although no wastage is expected'
            ]
        },
        textbook: {
            title: 'Calculus 2',
            author: 'Manasi Patil',
            score: 100,
            summary: 'This book is the exact same as the other one since no one can resist books written by Manasi Patil.'
        },
        gradingScheme: {
            gradingScheme: {
                'A': 93,
                'A-': 90,
                'B+': 88,
                'B': 85,
                'B-': 82,
                'C+': 75,
                'C': 70,
                'D': 68,
                'D-': 63,
                'F': 60
            },
            score: 80,
            summary: 'Standard grading scheme no comment'
        }
    };

    const [open, setOpen] = useState(false);
    const handleApproveClickOpen = () => {
        setStatus("Approved");
        setOpen(true);
    };

    const handleRejectClickOpen = () => {
        setStatus("Rejected");
        setOpen(true);
    };


    //update the request with comments
    const handleClose = () => {
        console.log("message:", message);
        console.log("status:", status)

        let requestDocRef = doc(db, 'Requests', requestID as string); // Replace 'YourCollectionName' with your actual collection name
        updateDoc(requestDocRef, {
            Comments: message ,
            Status: status
        });
        setOpen(false);
    };

    const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setMessage(event.target.value);
      };
    
    return (
        <PageContainer>
            <h1>Comparison Results</h1>
            {learningObjectivePercentages && 
    <Typography mt={6}>
        <DynamicBarChart syllabusComponents={syllabusComponents} />
    </Typography>
}

            <Box mt={3}>
                <Grid item xs={12} lg={16}>
                    <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={5}>
                        <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flex={1}>
                            <Button variant="contained"  color="primary" onClick={handleApproveClickOpen}>
                                Approve
                            </Button>
                        </Box>
                        <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} flex={1}>
                            <Button variant="contained"  color="error" onClick={handleRejectClickOpen}>
                                Deny
                            </Button>
                        </Box>
                    </Box>
                </Grid>
                <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      fullWidth
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="alert-dialog-slide-title" variant="h5">
        Add Comment
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description" component="div">
          <CustomFormLabel htmlFor="message-text">Message</CustomFormLabel>
          <TextField
            id="message-text"
            placeholder="Write a message"
            multiline
            fullWidth
            rows={4}
            variant="outlined"
            value={message}
            onChange={handleChange}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flex={1} ml={2}>
          <Button onClick={handleClose} color="primary" variant="contained">
            Submit
          </Button>
        </Box>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
            </Box>
        </PageContainer>
    );
};



Result.getLayout = function getLayout(page: ReactElement) {
    return <FullLayout>{page}</FullLayout>;
};

export default withRole({ Component: Result, roles: ['Reviewer', 'Transfer Specialist'] });