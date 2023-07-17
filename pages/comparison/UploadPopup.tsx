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
  requestID: string | string[] | undefined;
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

const UploadPopup: React.FC<UploadPopupProps> = ({ onExtractedData, requestID, userID }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [courseNameValue, setCodeValue] = useState<string>('');
  const [creditsValue, setCreditsValue] = useState<string>('');
  const [institutionValue, setInstitutionValue] = useState<string>('');
  const [textbookValue, setTextbookValue] = useState<string>('');
  const [courseCategory, setCourseCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  //MyUploads code--------------------------------------------------
  const [myUploads, setMyUploads] = useState<any[]>([]);
  const [courseNames, setCourseNames] = useState<string[]>([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');
  const [selectedCredits, setSelectedCredits] = useState<number>(0);
 
  

  //--------------------------------------------------------------

  const handleUploadBtnClick = (event: any) => {
    setAnchorEl(event.currentTarget);
   
  };

  // OS Parser API call
  async function parse_doc(data: any) {
    const api_token = '9c263dc72cfcf24432a1ae9acdab709c55ba14f4';
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

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      try {
        setLoading(true);

        // Read the file as an ArrayBuffer
        const fileBytes = await file.arrayBuffer();

        // Convert the ArrayBuffer to a Uint8Array for sending as binary data in the API request
        const fileData = new Uint8Array(fileBytes);

        // Call the parse_doc API function with the fileData
        const apiResponse = await parse_doc(fileData);
        console.log('OS API RESPONSE:', apiResponse);

        // Get the extracted data from the response
        const { extracted_sections, institution } = apiResponse.data;
        const courseNameHolder = extracted_sections.code;
        const creditsHolder = extracted_sections.credits;
        const institutionName = institution ? institution.name : '';
        const textbook = extracted_sections.required_reading;
        // Initialize the relevant variables
        let courseNameValue = '';
        let institutionValue = '';
        let creditsValue = '';
        let textbookValue = '';

        if (courseNameHolder && courseNameHolder.length > 0) {
          courseNameValue = courseNameHolder[0].text;
        }

        if (institutionName) {
          institutionValue = institutionName;
        }

        if (creditsHolder && creditsHolder.length > 0) {
          creditsValue = creditsHolder[0].text;
        }

        if (textbook && textbook.length > 0) {
          textbookValue = textbook[0].text;
        }

        console.log("textbook:" , textbookValue)

        // Update the institutionValue state to display in the CustomFormLabel
        setInstitutionValue(institutionValue);

        // Update the code, institution, and credits values in the respective states
        setCodeValue(courseNameValue);
        setCreditsValue(creditsValue);
        setTextbookValue(textbookValue);
      

        
        // Load the PDF document from the bytes
       const loadingTask = getDocument({ data: fileBytes });
       console.log('loadingTask:', loadingTask);

       loadingTask.promise
       .then(async (pdf: { numPages: number; getPage: (arg0: number) => any }) => {
         console.log('Promise resolved. PDF:', pdf);
         let fullText = '';

         // Loop through each page and extract text
         for (let i = 1; i <= pdf.numPages; i++) {
           const page = await pdf.getPage(i);

           // Extract the text content
           const content = await page.getTextContent();

           // Combine the text items into a single string
           const text = content.items.map((item: { str: any }) => item.str).join(' ');

           fullText += text + '\n';
         }

        const user = auth.currentUser;

        if (user) {
          const email = user.email;
          const q = query(collection(db, "Users"), where("Email", "==", email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
           
            setCourseCategory(userData.Department);
        }
        
        }

        //console.log(courseCategory)
        

           // Create the extracted data object
        const extractedData: SyllabusProps = {
          course: courseNameValue,
          credits: parseFloat(creditsValue),
          textbook: textbookValue, // Add the extracted textbook here
          learningObjectives: [], // Add the extracted learning objectives here
          fullText: fullText,
        };

        // Call the onExtractedData callback function with the extracted data
        onExtractedData(extractedData);

        //  //file upload to firebase

         try{

           //Create a reference to firebase storage and store the uploaded file in /uploads 
            const storageRef = ref(storage, 'uploads/' + file.name);
            await uploadBytes(storageRef, file);

            //Store the uploaded syllabus's path in /SyllabiURL
            const docRef = await addDoc(collection(db, 'SyllabiURL'), { fileUrl: storageRef.fullPath });
            setDocumentId(docRef.id);
            console.log('File uploaded successfully!');

            //console.log("CC", courseCategory)

            //Store the extracted sections and user-enetered fields in /Syllabi
            const syllabiDoc = {
              InstitutionName: institutionValue,
              CourseName: courseNameValue,
              Credits: Number(creditsValue),
              CourseCategory: courseCategory,
              TermType: "Semester",
              SyllabusURL: doc(db, 'SyllabiURL', docRef.id),
              Textbook: textbookValue,
            }

            const syllabiRef = await addDoc(collection(db, 'Syllabi'), syllabiDoc);
            console.log('Syllabus data stored successfully!');

            console.log("UserID", userID);
            //store the PSU syllabus under the User's myUploads
            let userDocRef = doc(db, 'Users', userID as string);

            // Get the user document from Firestore
            const userDocSnapshot = await getDoc(userDocRef);

            // Check if the MyUploads field exists in the user document
            if (userDocSnapshot.exists() && userDocSnapshot.data().MyUploads) {
              // If the MyUploads field already exists, add the syllabus document ID to the array
              const myUploadsArray = userDocSnapshot.data().MyUploads;
              myUploadsArray.push(syllabiRef.id);
              console.log("Pushed syllabus ref to MyUploads[]")

              // Update the user document with the updated MyUploads array
              await updateDoc(userDocRef, { MyUploads: myUploadsArray });
            } else {
              // If the MyUploads field doesn't exist, create it with the syllabus document ID as the first element of the array
              await setDoc(userDocRef, { MyUploads: [syllabiRef.id] }, { merge: true });
              console.log("Created MyUploads[] and added the syllabus ref to it")
            }

            //here
            let requestDocRef = doc(db, 'Requests', requestID as string); 

            await updateDoc(requestDocRef, {
                PSUSyllabus: doc(db, 'Syllabi', syllabiRef.id) // Replace 'YourPSUSyllabusCollectionName' with your actual PSUSyllabus collection name
            });
            console.log('Request updated successfully!');




          } catch (error) {
            console.error('Failed to upload file:', error);
          }
       })
       .catch((error: any) => {
        console.error('Error loading PDF:', error);
      });
        handleClose();  // Close the popup here
        
      } catch (error) {
        console.error('Failed to parse document:', error);
      } finally {
        setLoading(false);
      }
    }

  };

 
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  //MyUploads code--------------------------------------------------------------
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
  
        // Get the courseName and credits
        const courseNameValue = data.CourseName;
       
        const creditsValue = data.Credits;
        
        const syllabusURLRef = data.SyllabusURL;
        
        const syllabusURLDocSnapshot = await getDoc(syllabusURLRef);
        if(syllabusURLDocSnapshot.exists()){

          const syllabusURLDocData = syllabusURLDocSnapshot.data() as SyllabusURLDoc;
          const storageFileURL = syllabusURLDocData.fileUrl;

          // Get the file URL from Firebase Storage
          const fileRef = ref(storage, storageFileURL);
          const fileBytes = await getBytes(fileRef);
          
          // Load the PDF document from the bytes
          const loadingTask = getDocument({ data: fileBytes });
          console.log('loadingTask:', loadingTask);
    
          loadingTask.promise
            .then(async (pdf: { numPages: number; getPage: (arg0: number) => any }) => {
              console.log('Promise resolved. PDF:', pdf);
              let fullText = '';
    
              // Loop through each page and extract text
              for (let i = 1; i <= pdf.numPages; i++) {
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
                textbook: '', // You would need to extract this from the text you've just read
                learningObjectives: [], // And this as well
                fullText: fullText,
              };
    
              // Call the onExtractedData callback function with the extracted data
              onExtractedData(extractedData);
            })
            .catch((error: any) => {
              console.error('Error loading PDF:', error);
            });
        }
    
        handleClose();  // Close the popup here
    
      
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
          onClick={handleUploadBtnClick}
        >
          Upload File
        </Button>
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
            Upload File
          </DialogTitle>
          <Grid m={4}>
            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
              <Grid m={4}>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <Input
                      type="file"
                      style={{ display: 'none' }}
                      id="file-upload"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="file-upload">
                      <Button variant="contained" component="span">
                        Upload New
                      </Button>
                    </label>
                  </>
                )}
              </Grid>
            </Box>

            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
              <Grid m={2}>or</Grid>
            </Box>

            
              <Grid m={4}>
             
       
              <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
         <p>Choose from your existing files</p>
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

              </Grid>
          
          </Grid>

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

export default UploadPopup;