import { Grid, InputAdornment, Button, Input, Typography, LinearProgress, Box } from '@mui/material';
import CustomTextField from '../../src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../src/components/forms/theme-elements/CustomFormLabel';
import ComboBoxAutocomplete from '../../src/components/forms/form-elements/autoComplete/ComboBoxAutocomplete';
import { useRouter } from "next/router";
import { getBytes, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { db, storage, auth } from '../../config/firebase';
import { ChangeEvent, ReactElement, SetStateAction, useEffect, useRef, useState } from 'react';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import axios from 'axios';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import FullLayout from '../../src/layouts/full/FullLayout';
import CustomNextPage from '../../types/custom';
import Head from 'next/head';
import { getDocument, GlobalWorkerOptions} from 'pdfjs-dist';
import withRole from '../../src/components/hocs/withRole';
import CoursesTable from './CoursesTable';
import HoverButton from '../ui-components/HoverButton';
import { Switch } from '@mui/material';
import { styled } from '@mui/material/styles';

GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';

const CustomLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10, // Adjust the height to make the loading bar thicker
    borderRadius: 5, // Add some border radius for a rounded appearance
    backgroundColor: theme.palette.grey[300], // Change the background color
    '& .MuiLinearProgress-bar': {
        borderRadius: 5, // Add border radius for the progress bar
        backgroundColor: theme.palette.primary.main, // Change the progress bar color
    },
}));

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

async function callCSVFunc(fullText:string, usingResume:boolean) {
    console.log("full text sending to csv: " + fullText);
    try {
        const response = await axios.post('https://64dctbfpypozkldozv3yvcdr740jwqyh.lambda-url.us-east-1.on.aws/', {
            FullText: fullText,
            UsingResume: usingResume
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log(response.data)
        const data = response.data.agent_result;
        return data;
    } catch (error) {
        console.error(`Error calling lambda function: ${error}`);
        return "Error calling";
    }
}

const CourseMatch: CustomNextPage = () => {
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
    const [courses, setCourses]= useState<string[]>([]);
    const [foolText, setFullText] = useState<string>('');
    const [showTable, setShowTable] = useState(false);
    const [usingResume, setUsingResume] = useState(false);
    const router = useRouter();
    const [loadingProgress, setLoadingProgress] = useState(0);
    const cancelTokenRef = useRef<{} | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoading) {
            const token = {};  // Create a unique cancellation token
            cancelTokenRef.current = token;

            const simulateProgress = async () => {
                for (let i = 1; i <= 100; i += 1) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    // If the token has been cancelled, exit the simulation
                    if (cancelTokenRef.current !== token) return;

                    setLoadingProgress(i);
                }
                setLoadingProgress(100);
            };

            simulateProgress();

            // Return a cleanup function to cancel the simulation
            return () => {
                cancelTokenRef.current = null;
            };
        }
    }, [isLoading]);

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
                let bytes = new ArrayBuffer(0);
                if (ocrCheck.isSelectable == false) {
                    setIsSectable(ocrCheck.isSelectable);
                    setOCRContent(ocrCheck.fileContent);
                    let encoder = new TextEncoder();
                    fileData = encoder.encode(ocrCheck.fileContent);
         
                    console.log("IS NOT SELECTABLE fileData",  fileData);
         
                    //convert to bytes
                }
                else {
                    // Read the file as an ArrayBuffer
                    const fileBytes = await file.arrayBuffer();
                    bytes = fileBytes;
  
                    console.log("filebytes", fileBytes);
                    // Convert the ArrayBuffer to a Uint8Array for sending as binary data in the API request
                    fileData = new Uint8Array(fileBytes);
  
                    console.log("IS SELECTABLE filedata", fileData);
        
                }

                //ONLY EXTRACT THE SECTIONS W/ OS PARSER IF IT'S NOT  A RESUME------------------
                if (usingResume==false) {
                    // Call the parse_doc API function with the fileData
                    const apiResponse = await parse_doc(fileData);
                    console.log('OS API RESPONSE:', apiResponse);
  
                    // Get the extracted data from the response
                    const { field, extracted_sections, institution } = apiResponse.data;
                    const courseNameHolder = extracted_sections.code;
                    const creditsHolder = extracted_sections.credits;
                    const courseCategoryName = field.name;
        
                    let courseNameValue = '';
       
                    let creditsValue = '';
                    let courseCategoryValue = '';
       
                    if (courseNameHolder && courseNameHolder.length > 0) {
                        courseNameValue = courseNameHolder[0].text;
                    }
  
                    if (creditsHolder && creditsHolder.length > 0) {
                    creditsValue = creditsHolder[0].text;
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
                    setCourseCategoryValue(courseCategoryValue);

                }
        
                // Only proceed with the following code if ocrCheck.isSelectable is true
                if (ocrCheck.isSelectable == true) {
                    console.log("filebytes inside the if(ocrCheck.isSelectable)", fileBytes);
                      // Load the PDF document from the bytes
                    const pdf = await getDocument({ data: bytes }).promise;
                    console.log('PDF:', pdf);
                    let fullText = '';

                    // Loop through each page and extract text
                    for (let i = 1; i <= Math.min(5, pdf.numPages); i++) {
                        const page = await pdf.getPage(i);

                        // Extract the text content
                        const content = await page.getTextContent();

                        // Combine the text items into a single string
                        const text = content.items.map((item) => {
                            if ('str' in item) {
                                // Handle the TextItem type
                                return item.str;
                            } else {
                                // Handle the TextMarkedContent type (e.g., for marked content)
                                return '';
                            }
                        }).join(' ');

                        fullText += text + '\n';
                    }
                    console.log("INSIDE HANDLE FILE SELECT" + fullText);
                    setFullText(fullText);
                }  
            } catch (error) {
                console.error('Failed to parse document:', error);
            }
        }
    }; 

    //change this---------------------
    const checkFormCompletion = () => {
        if(usingResume==false){
            if (
                courseNameValue &&
                creditsValue &&
                courseCategoryValue &&
                selectedFile
            ) {
                setIsFormComplete(true);
            } else {
                setIsFormComplete(false);
            }
        } else {
            if (selectedFile) {
                setIsFormComplete(true);
            } else {
                setIsFormComplete(false);
            }
        }
    };

    //File upload to firebase   
    const handleSubmit = async () => {
        setIsLoading(true);
        console.log("FINDING COURSES!!!!!: "+ foolText);
        let csvResponse = await callCSVFunc(foolText, usingResume);
        setCourses(csvResponse);
        //setCourses(["CHEM 130: Introduction to General, Organic, and Biochemistry", "CHEM 140: General Chemistry I", "CHEM 141: General Chemistry II", "CHEM 150: General Chemistry I for Engineering Students", "CHEM 151: General Chemistry II for Engineering Students"])

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

        //only upload the file to firebase if it's NOT a resume -------------------------
        if (selectedFile && usingResume==false) {
            try {
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
            } catch (error) {
                console.error('Failed to upload file:', error);
            }
        } else {
            console.error('No file selected!');
        }
        setShowTable(true);
        setIsLoading(false);
    };

    //check this----------------
    useEffect(() => {
        checkFormCompletion();
    }, [
        courseNameValue,
        creditsValue,
        courseCategoryValue,
        selectedFile,
    ]);


    return (
        <>
            {/* ------------------------------------------------------------------------------------------------ */}
            {/* Basic Layout */}
            {/* ------------------------------------------------------------------------------------------------ */}
            {/* Use the HoverButton component here */}
            <Grid item xs={12} mt={3} mb={3}>
                <HoverButton instructions="This is the Course Matcher
                    Upload a syllabus or resume, and see what course(s) at PSU you could potentially transfer in for. " />
            </Grid>  
            <Grid item xs={12} mt={3}>
                <Switch
                    checked={usingResume}
                    onChange={() => setUsingResume(!usingResume)}
                    color="primary"
                    inputProps={{ 'aria-label': 'Using Resume' }}
                />
                <span style={{ marginLeft: '10px' }}>Using Resume</span>
            </Grid>
            <Grid container>
                {/* 1 */}
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
                {/* 3 */}
                {usingResume ? null : (
                    <>
                        <Grid item xs={12} display="flex" alignItems="center" sx={{ mt: 3 }}>
                            <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
                                Course Name
                            </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12}>
                            <CustomTextField id="bl-code" placeholder="ex. METH 140" fullWidth value={courseNameValue} onChange={(event: { target: { value: SetStateAction<string>; }; }) => setCodeValue(event.target.value)} />
                        </Grid>
                        <Grid item xs={12} display="flex" alignItems="center">
                            <CustomFormLabel htmlFor="credits" >
                                Credits
                            </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12}>
                            <CustomTextField id="bl-credit" placeholder="ex. 3" fullWidth value={creditsValue} onChange={(event: { target: { value: SetStateAction<string>; }; }) => setCreditsValue(event.target.value)} />
                        </Grid>
                        <Grid item xs={12} display="flex" alignItems="center">
                            <CustomFormLabel htmlFor="bl-category">
                                Course Category
                            </CustomFormLabel>
                        </Grid>
                        <Grid item xs={12}>
                            <CustomTextField id="bl-category" placeholder="ex. Biology" fullWidth value={courseCategoryValue} onChange={(event: { target: { value: SetStateAction<string>; }; }) => setCourseCategoryValue(event.target.value)} />
                        </Grid>
                    </>
                )}
                <Grid item xs={12} mt={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Find Courses
                    </Button>
                    {isLoading && (
                        <Box sx={{ width: "100%", mt: 2 }}>
                            <CustomLinearProgress variant="determinate" value={loadingProgress} />
                        </Box>
                    )}
                    {showTable && <CoursesTable courses={courses} />}
                </Grid>
            </Grid>
            <Head>
                <script src="/pdf.worker.js" />
            </Head>
        </>
    );
};

CourseMatch.getLayout = function getLayout(page: ReactElement) {
    return <FullLayout>{page}</FullLayout>;
};

export default withRole({ Component: CourseMatch, roles: ['Student', 'Transfer Specialist', 'Faculty'] });