import React, { ChangeEvent, useState } from 'react';
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  Slide,
  DialogActions,
  Grid,
  Input,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import axios from 'axios';
import { getDocument, GlobalWorkerOptions} from 'pdfjs-dist';
import { ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';

// Syllabus extracted sections - to be extracted by OS Parser
interface SyllabusProps {
  course: string;
  credits: number;
  textbook: string;
  learningObjectives: string[];
  fullText: string;
}

interface UploadPopupProps {
  requestID: string | string[] | undefined;
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

const UploadPopup: React.FC<UploadPopupProps> = ({ onExtractedData, requestID }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [courseNameValue, setCodeValue] = useState<string>('');
  const [creditsValue, setCreditsValue] = useState<string>('');
  const [institutionValue, setInstitutionValue] = useState<string>('');
  const [textbook, setTextbook] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

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
        const textbook = extracted_sections.textbook;
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

        if (textbook) {
          textbookValue = textbook;
        }

        console.log("textbook:" , textbookValue)

        // Update the institutionValue state to display in the CustomFormLabel
        setInstitutionValue(institutionValue);

        // Update the code, institution, and credits values in the respective states
        setCodeValue(courseNameValue);
        setCreditsValue(creditsValue);
        setTextbook(textbookValue);
      

        
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


            //Store the extracted sections and user-enetered fields in /Syllabi
            const syllabiDoc = {
              InstitutionName: institutionValue,
              CourseName: courseNameValue,
              Credits: Number(creditsValue),
              CourseCategory: "courseCategoryValue",
              TermType: "Semester",
              SyllabusURL: doc(db, 'SyllabiURL', docRef.id)
            }

            const syllabiRef = await addDoc(collection(db, 'Syllabi'), syllabiDoc);
            console.log('Syllabus data stored successfully!');

            //here
            let requestDocRef = doc(db, 'Requests', requestID as string); // Replace 'YourCollectionName' with your actual collection name

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

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

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

            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
              <Grid m={4}>
                <Button color="secondary" variant="contained">
                  Choose from existing files
                </Button>
              </Grid>
            </Box>
          </Grid>

          {/**Upload Btn Actions */}
          <DialogActions></DialogActions>
        </Dialog>
      </Grid>
    </Box>
  );
};

export default UploadPopup;