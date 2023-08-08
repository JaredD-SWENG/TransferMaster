import { Grid, InputAdornment, Button, Input, Typography } from '@mui/material';
//import {CustomFormLabel, CustomTextField } from '@mui/base/AutocompleteUnstyled';
//import  from '@theme-elements/CustomTextField';
//import CustomOutlinedInput from '@theme-elements/CustomOutlinedInput';
//import ComboBoxAutocomplete from '@autoComplete/ComboBoxAutocomplete';
//import Land from '@mui/base';
//import { TextField } from '@mui/material';
import CustomTextField from '../../src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../src/components/forms/theme-elements/CustomFormLabel';
import ComboBoxAutocomplete from '../../src/components/forms/form-elements/autoComplete/ComboBoxAutocomplete';
import { useRouter } from "next/router";
import { getBytes, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { db, storage, auth } from '../../config/firebase';
import { ChangeEvent, ReactElement, SetStateAction, useEffect, useState } from 'react';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import axios from 'axios';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import withRole from '../../src/components/hocs/withRole';
import FullLayout from '../../src/layouts/full/FullLayout';
import CustomNextPage from '../../types/custom';
import Head from 'next/head';
import { getDocument, GlobalWorkerOptions} from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';
import HoverButton from "../ui-components/HoverButton";

async function callOCRCheck(fileURL:string) {
  console.log("file url: " + fileURL);
  try {
      const response = await axios.post('https://o6utjsi2fp4nhvr4mojyypwgu40aspyt.lambda-url.us-east-1.on.aws/', {
          PdfUrl: fileURL
      }, {
          headers: {
              'Content-Type': 'application/json',
          },
      });
      console.log(response)
      const data = response.data
      return data;

     
    
  } catch (error) {
    console.error(`Error calling lambda function: ${error}`);
    return "Error calling";
  }
}
const StudentUploadPage: CustomNextPage = () => {

  //OS Parser API call 
  async function parse_doc(data: any) {
    const api_token = process.env.NEXT_PUBLIC_OS_PARSER_API_TOKEN; 
    const response = await axios.post('https://parser-api.opensyllabus.org/v1/', data, {
      headers: {
        'Authorization': `Token ${api_token}`,
      },
    });
    return response.data;
  }
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [institutionValue, setInstitutionValue] = useState<string>('');
  const [courseNameValue, setCodeValue] = useState<string>('');
  const [creditsValue, setCreditsValue] = useState<string>('');
  const [courseCategoryValue, setCourseCategoryValue] = useState<string>('');
  const [termTypeValue, setTermTypeValue] = useState<string>('');
  const [gradeValue, setGradeValue] = useState<string>('');
  const [textbookValue, setTextBookValue] = useState<string>('');
  const [learningObjectivesValue, setLearningObjectivesValue] = useState<string[]>([]);
  const [isSelectable, setIsSectable] = useState(true);
  const [OCRContent, setOCRContent] = useState<string>('');
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [storageRefPath, setStorageRefPath] = useState<string>('');
  const [userID, setUserID] = useState<string>('');
  const [fileData, setFileData] = useState<Uint8Array>();
  const [fileBytes, setFileBytes] = useState<ArrayBuffer>();

  const router = useRouter();

  const handleTermChange = (value: string) => {
    setTermTypeValue(value);
    
  };
  //File selection 
  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      try {

        //Create a reference to firebaes storage and store the uploaded file in /uploads 
        const storageRef = ref(storage, 'uploads/' + file.name);
        await uploadBytes(storageRef, file);
        setStorageRefPath(storageRef.fullPath);

        const downloadUrl = await getDownloadURL(storageRef); 
        
        //call to OCR:  callOCRCheck(downloadUrl)
       const ocrCheck = await callOCRCheck(downloadUrl);

       let fileData = new Uint8Array();
       if (ocrCheck.isSelectable == false){
         setIsSectable(ocrCheck.isSelectable);
         setOCRContent(ocrCheck.fileContent);
         let encoder = new TextEncoder();
         fileData = encoder.encode(ocrCheck.fileContent);
         console.log("IS NOT SELECTABLE fileData",  fileData);
         
         //convert to bytes
       }
       else{
        // Read the file as an ArrayBuffer
        const fileBytes = await file.arrayBuffer();
        setFileBytes(fileBytes);
  
        console.log("filebytes", fileBytes);
        // Convert the ArrayBuffer to a Uint8Array for sending as binary data in the API request
        fileData = new Uint8Array(fileBytes);
  
        console.log("IS SELECTABLE fileData",  fileData);
        
       }

        
        // Call the parse_doc API function with the fileData
        const apiResponse = await parse_doc(fileData);
        console.log('OS API RESPONSE:', apiResponse);
  
        // Get the extracted data from the response
        const { field, extracted_sections, institution } = apiResponse.data;
        const courseNameHolder = extracted_sections.code;
        const creditsHolder = extracted_sections.credits;
        const institutionName = institution ? institution.name : '';
        const textbook = extracted_sections.required_reading;
        const learningObjectives = extracted_sections.learning_outcomes;
        const courseCategoryName = field.name;

        // Initialize the relevant variables
        let courseNameValue = '';
        let institutionValue = '';
        let creditsValue = '';
        let textbookValue = '';
        let learningObjectivesValue: string[] = [];
        let courseCategoryValue = '';

        if (courseNameHolder && courseNameHolder.length > 0) {
          courseNameValue = courseNameHolder[0].text;
        }
  
        if (institutionName) {
          institutionValue = institutionName;
        }
  
        if (creditsHolder && creditsHolder.length > 0) {
          creditsValue = creditsHolder[0].text;
        }

        if(textbook && textbook.length > 0){
          textbookValue = textbook[0].text;
        }
        
        if (learningObjectives && learningObjectives.length > 0) {
          learningObjectivesValue = learningObjectives.map((outcome: { text: string; }) => outcome.text);
        }

        if (courseCategoryName) {
          courseCategoryValue = courseCategoryName;
        }
  
        // Update the institutionValue state to display in the CustomFormLabel
        setInstitutionValue(institutionValue);
  
        // Update the code, institution, and credits values in the respective states
        setCodeValue(courseNameValue);
        setCreditsValue(creditsValue);
        setTextBookValue(textbookValue);
        setLearningObjectivesValue(learningObjectivesValue);
        setCourseCategoryValue(courseCategoryValue)
       // Only proceed with the following code if ocrCheck.isSelectable is true
       console.log("ocrCheck.isSelectable" + ocrCheck.isSelectable);
        if (ocrCheck.isSelectable) {
          console.log("filebytes inside the if(ocrCheck.isSelectable)", fileBytes);
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
  
              
  
             
            })
            .catch((error: any) => {
              console.error('Error loading PDF:', error);
            });
        }
  
      } catch (error) {
        console.error('Failed to parse document:', error);
      }
    }
  }; // Add this closing bracket
  
  
  const checkFormCompletion = () => {
    if (
      institutionValue &&
      courseNameValue &&
      creditsValue &&
      courseCategoryValue &&
      termTypeValue &&
      gradeValue &&
      selectedFile
    ) {
      setIsFormComplete(true);
    } else {
      setIsFormComplete(false);
    }
  };
  

 //File upload to firebase   
const handleSubmit = async () => {

  const user = auth.currentUser;
  let userId = null;
  if (user) {
    const email = user.email;
    const q = query(collection(db, "Users"), where("Email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      userId = userDoc.id;
      setUserID(userId);
    }
    console.log(userId);
  }
  if (selectedFile) {
    try {
      // //Create a reference to firebaes storage and store the uploaded file in /uploads 
      // const storageRef = ref(storage, 'uploads/' + selectedFile.name);
      // await uploadBytes(storageRef, selectedFile);

      //Store the uploaded syllabus's path in /SyllabiURL
      const docRef = await addDoc(collection(db, 'SyllabiURL'), { fileUrl: storageRefPath });
      setDocumentId(docRef.id);
      console.log('File uploaded successfully!');

      //Store the extracted sections and user-enetered fields in /Syllabi
      
      const syllabiDoc = {
        InstitutionName: institutionValue,
        CourseName: courseNameValue,
        Credits: Number(creditsValue),
        CourseCategory: courseCategoryValue,
        TermType: termTypeValue,
        SyllabusURL: doc(db, 'SyllabiURL', docRef.id),
        Textbook: textbookValue,
        Objectives: learningObjectivesValue,
        IsSelectable: isSelectable,
        OCRContent: OCRContent,
      }

      const syllabiRef = await addDoc(collection(db, 'Syllabi'), syllabiDoc);
      console.log('Syllabus data stored successfully!');

      console.log("userID", userId);
        //store the external syllabus under the User's myUploads
        let userDocRef = doc(db, 'Users', userId as string);
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

       //Create and store a request in /Requests (once the syllabus is uploaded )
      const requestDoc = {
        Comments: null,
        Date: serverTimestamp(),
        ExternalSyllabus: doc(db, 'Syllabi', syllabiRef.id),
        Grade: gradeValue,
        PSUSyllabus: null,
        Requester: userId ? doc(db, "Users", userId) : null,
        Reviewer: null, 
        Status: 'Submitted'
      };

      const requestRef = doc(collection(db, 'Requests')); // Generate a new document reference that can be passed as a URL parameter to another page 
      await setDoc(requestRef, requestDoc);
      console.log('Request data stored successfully!');

     



    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  } else {
    console.error('No file selected!');
  }

  router.push('../../dashboards/student'); //once they submit request, take student back to dashboard
};

useEffect(() => {
  checkFormCompletion();
}, [
  institutionValue,
  courseNameValue,
  creditsValue,
  courseCategoryValue,
  termTypeValue,
  gradeValue,
  selectedFile,
]);

useEffect(() => {
  const fetchDocumentUrl = async () => {
    if (documentId) {
      const docSnapshot = await getDoc(doc(db, 'syllabiURL', documentId));
      if (docSnapshot.exists()) {
        const { fileUrl } = docSnapshot.data();
        const downloadUrl = await getDownloadURL(ref(storage, fileUrl));
        console.log('File URL:', downloadUrl);

         // Fetch the bytes of the PDF file
         const fileRef = ref(storage, fileUrl);
         const fileBytes = await getBytes(fileRef);
         console.log('File Bytes:', fileBytes);

           
   
         /**To use getBytes() you have to set up CORS configuration in Google cloud
          * gsutil cors get gs://transfermaster-a871b.appspot.com
[{"maxAgeSeconds": 3600, "method": ["GET"], "origin": ["*"], "responseHeader": ["Content-Type"]}]
          */
          // Load the PDF document from the bytes
          const loadingTask = getDocument({data: fileBytes});
          loadingTask.promise.then(async (pdf: { numPages: number; getPage: (arg0: number) => any; }) => {
              let fullText = "";

              // Loop through each page and extract text
              for(let i = 1; i <= Math.min(5, pdf.numPages); i++) {
                  const page = await pdf.getPage(i);

                  // Extract the text content
                  const content = await page.getTextContent();

                  // Combine the text items into a single string
                  const text = content.items.map((item: { str: any; }) => item.str).join(' ');

                  fullText += text + "\n";
              }

              console.log('PDF Text:', fullText);
          });

      
      
      
      }
    }
  };

  fetchDocumentUrl();
}, [documentId]);


  return (
    <div>
      {/* ------------------------------------------------------------------------------------------------ */}
      {/* Basic Layout */}
      {/* ------------------------------------------------------------------------------------------------ */}
      <Grid container>
        {/* 1 */}
        <Grid item xs={12} mt={3}>
           {/* Use the HoverButton component here */}
       <HoverButton instructions="Submit a new transfer request here. 
        Start by uploading a syllabus.
        Our tool will extract the relevant fields.
        Make any corrections if required.
        Make sure all fields are entered beore you submit." />
        </Grid>
        <Grid item xs={12} mt={3}>
          <Input type="file" style={{ display: 'none' }} id="file-upload" onChange={handleFileSelect} />
          <label htmlFor="file-upload">
            <Button variant="contained" component="span">
              Upload File
            </Button>
          </label>
        </Grid>

        {/* Display selected file name */}
        <Grid item xs={12} mt={1}>
          {selectedFile && (
            <Typography variant="body1">
              Selected File: {selectedFile.name}
            </Typography>
          )}
        </Grid>


      
      
        {/* 2 */}
        <Grid item xs={12} display="flex" alignItems="center" sx={{ mt: 3 }}>
        <CustomFormLabel htmlFor="institution" sx={{ mt: 0 }}>
        Institution Name
        </CustomFormLabel>
        </Grid>
      <Grid item xs={12}>
      <CustomTextField id="bl-institution" placeholder="Hotel transylvannia State" fullWidth value={institutionValue} onChange={(event: { target: { value: SetStateAction<string>; }; }) => setInstitutionValue(event.target.value)} />
    </Grid>
        {/* 3 */}
        <Grid item xs={12} display="flex" alignItems="center" sx={{ mt: 3 }}>
          <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
            Course Name
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField id="bl-code" placeholder="ex. MATH 140" fullWidth value={courseNameValue} onChange={(event: { target: { value: SetStateAction<string>; }; }) => setCodeValue(event.target.value)} />
        </Grid>
        {/* 4 */}
        <Grid item xs={12} display="flex" alignItems="center">
          <CustomFormLabel htmlFor="credits"  >
            Credits
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField id="bl-credit" placeholder="3" fullWidth value={creditsValue} onChange={(event: { target: { value: SetStateAction<string>; }; }) => setCreditsValue(event.target.value)} />
        </Grid>
        {/* 5 */}
        <Grid item xs={12} display="flex" alignItems="center">
          <CustomFormLabel htmlFor="bl-grade">
            Grade
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField id="bl-grade" placeholder="A" fullWidth value={gradeValue} onChange={(event: { target: { value: SetStateAction<string>; }; }) => setGradeValue(event.target.value)} />
        </Grid>
        {/* 6 */}
        <Grid item xs={12} display="flex" alignItems="center">
          <CustomFormLabel htmlFor="bl-category">
            Course Category
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12}>
          <CustomTextField id="bl-category" placeholder="Biology" fullWidth value={courseCategoryValue} onChange={(event: { target: { value: SetStateAction<string>; }; }) => setCourseCategoryValue(event.target.value)} />
        </Grid>
        {/* 7 */}
        <Grid item xs={12} display="flex" alignItems="center">
          <CustomFormLabel htmlFor="bl-type">
            Term Type
          </CustomFormLabel>
        </Grid>
        <Grid item xs={12}>
        <ComboBoxAutocomplete
            value={termTypeValue}
            setValue={handleTermChange}
            options={['Semester', 'Quarter']}
            placeholder="Select Term Type"
          />
        </Grid>
        {/* 8 */}
       
       
        
        {/* 9 */}
        <Grid item xs={12} mt={3}>
        <Button
  variant="contained"
  color="primary"
  disabled={!isFormComplete}
  onClick={handleSubmit}
>
  Submit
</Button>
        </Grid>
      </Grid>
      <Head>
        <script src="/pdf.worker.js" />
      </Head>
    </div>
  );
};

StudentUploadPage.getLayout = function getLayout(page: ReactElement) {
    return <FullLayout>{page}</FullLayout>;
};

export default withRole({ Component: StudentUploadPage, roles: ['Student'] });