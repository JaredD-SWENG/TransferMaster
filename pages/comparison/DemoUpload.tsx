import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  Slide,
  DialogActions,
  Grid,
  Input,
  TextField,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Checkbox,
  Radio,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import axios from 'axios';
import { getDocument, GlobalWorkerOptions} from 'pdfjs-dist';
import { getBytes, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage, auth } from '../../config/firebase';
import { query,addDoc, collection, doc, getDoc, setDoc, updateDoc, where, getDocs, DocumentReference } from 'firebase/firestore';
import { dispatch, useDispatch, useSelector } from '../../src/store/Store';
import { SearchTicket, fetchTickets } from '../../src/store/apps/tickets/TicketSlice';
import tickets from '../apps/tickets';
import { TicketType } from '../../src/types/apps/ticket';
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';



// Syllabus extracted sections - to be extracted by OS Parser
interface SyllabusProps {
  course: string;
  credits: number;
  textbook: string;
  learningObjectives: string[];
  fullText: string;
  downloadUrl: string;
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



interface UploadPopupProps {
  
  userID: string | string[] | undefined; 
  onExtractedData: (data: SyllabusProps) => void;
}

// Transitions
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DemoUpload: React.FC<UploadPopupProps> = ({ onExtractedData, userID }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [courseNameValue, setCodeValue] = useState<string>('');
  const [creditsValue, setCreditsValue] = useState<string>('');
  const [institutionValue, setInstitutionValue] = useState<string>('');
  const [textbookValue, setTextbookValue] = useState<string>('');
  const [learningObjectivesValue, setLearningObjectivesValue] = useState<string[]>([]);
  const [courseCategory, setCourseCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl ] = useState<string>('');
  //MyUploads code--------------------------------------------------
  const [myUploads, setMyUploads] = useState<any[]>([]);
  const [courseNames, setCourseNames] = useState<string[]>([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');
  const [selectedCredits, setSelectedCredits] = useState<number>(0);
  const [selectedTextbook, setSelectedTextbook] = useState<string>('');
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);


  //--------------------------------------------------------------

  const handleExtUploadBtnClick = (event: any) => {
    
    setAnchorEl(event.currentTarget);
    //handleExtFileSelect(event);
  };

  // OS Parser API call
  async function parse_doc(data: any) {
    const api_token = process.env.NEXT_PUBLIC_OS_PARSER_API_TOKEN;;
    const response = await axios.post(
      'https://parser-api.opensyllabus.org/v1/',
      data,
      {
        headers: {
          Authorization: `Token ${api_token}`,
        },
      }
    );
    return response.data;
  }

  
 
  
  const handleExtClose = () => {
    setAnchorEl(null);
  };

  //MyUploads code--------------------------------------------------------------
  useEffect(() => {
    const getUserMyUploads = async () => {
     
        const q = query(collection(db, 'DemoSyllabi'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          const myUploads = userData.MyUploads || [];
          setMyUploads(myUploads);
        
      }
    };
  
    getUserMyUploads();
  }, []);
  //--------------------------------------------------------------
  
  
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  
  
  
  
  
    const dispatch = useDispatch();
    const theme = useTheme();
  
   
  
   
    useEffect(() => {
      dispatch(fetchTickets());
    }, [dispatch]);
  
    
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
    
  
    //MyUploads code--------------------------------------------------------------
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

   const handleSyllabusSelect = (syllabusId: string) => {
          // Select the clicked syllabus
          setSelectedSyllabusId(syllabusId);
          

        
        console.log(selectedSyllabusId)
       
        
        
        
};

    
    
const handleOkClick = async () => {
  console.log("button pressed");
   // if user has chosen a file from existing files
    try {
      setLoading(true);
  
      // Retrieve the document metadata from Firestore
      const docRef = doc(db, 'Syllabi', selectedSyllabusId);
      const docData = await getDoc(docRef);
  
      if (docData.exists()) {
        const data = docData.data();
  
        // Get all the fields
        const courseNameValue = data.CourseName;
       
        const creditsValue = data.Credits;

        const textbookValue = data.Textbook;

        const objectivesValue = data.Objectives;
        
        const syllabusURLRef = data.SyllabusURL;
        
        const syllabusURLDocSnapshot = await getDoc(syllabusURLRef);
        if(syllabusURLDocSnapshot.exists()){

          const syllabusURLDocData = syllabusURLDocSnapshot.data() as SyllabusURLDoc;
          const storageFileURL = syllabusURLDocData.fileUrl;

          // Get the file URL from Firebase Storage
          const fileRef = ref(storage, storageFileURL);
          const fileBytes = await getBytes(fileRef);
          const downloadUrl = await getDownloadURL(ref(storage, storageFileURL));
          
          // Load the PDF document from the bytes
          const loadingTask = getDocument({ data: fileBytes });
          console.log('loadingTask:', loadingTask);
    
          loadingTask.promise
            .then(async (pdf: { numPages: number; getPage: (arg0: number) => any }) => {
              console.log('Promise resolved. PDF:', pdf);
              let fullText = '';
    
              // Loop through each page and extract text
              for (let i = 1; i <= Math.min(5, pdf.numPages); i++) {
                const page = await pdf.getPage(i);
    
                // Extract the text content
                const content = await page.getTextContent();
    
                // Combine the text items into a single string
                const text = content.items.map((item: { str: any }) => item.str).join(' ');
    
                fullText += text + '\n';
              }
    
              //console.log('PDF Text:', fullText);
    
              // Create the extracted data object
              const extractedData: SyllabusProps = {
                course: courseNameValue,
                credits: parseFloat(creditsValue),
                textbook: textbookValue, // You would need to extract this from the text you've just read
                learningObjectives: objectivesValue, // And this as well
                fullText: fullText,
                downloadUrl: downloadUrl, 
              };
    
              // Call the onExtractedData callback function with the extracted data
              onExtractedData(extractedData);
            })
            .catch((error: any) => {
              console.error('Error loading PDF:', error);
            });
        }
    
        handleExtClose();  // Close the popup here
    
      
      }} catch (error) {
        console.error('Failed to retrieve document:', error);
      } finally {
        setLoading(false);
      }
       
  
  
  
};
     //--------------------------------------------------------------
    
    
    

  return (
    <Box>
      <Grid mb={4}>
        <Button
          variant="contained"
          component="span"
          onClick={handleExtUploadBtnClick}
        >
          Upload File
        </Button>
        <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleExtClose}
          fullWidth
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title" variant="h5">
            Upload File
          </DialogTitle>
          
             
       
              <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
         <p>Choose a Syllabus</p>
         </Box>
         <Box>
  <TextField
    size="small"
    label="Search"
    fullWidth
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
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
             
             </TableRow>
           </TableHead>
           <TableBody>
  {myUploads.map((upload, index) => (
    <TableRow key={upload}>
      <TableCell padding="checkbox">
        <Radio
          checked={selectedSyllabusId === upload}
          onChange={() => handleSyllabusSelect(upload)}
        />
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

              

          {/**Upload Btn Actions */}
         
    <DialogActions>
      <Button variant="contained" color="primary" onClick={handleOkClick}>
        OK
      </Button>
    </DialogActions>
        </Dialog>
      </Grid>
      
    </Box>
  );
};

export default DemoUpload;