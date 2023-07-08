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
    Typography, 
    Card,
    Grid,
    Input} from "@mui/material";
import ParentCard from "../../src/components/shared/ParentCard";
import PageContainer from "../../src/components/container/PageContainer";
import CustomFormLabel from "../../src/components/forms/theme-elements/CustomFormLabel";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CustomRangeSlider from "../../src/components/forms/theme-elements/CustomRangeSlider";
import { getDoc, DocumentData, doc, DocumentReference } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { TransitionProps } from '@mui/material/transitions';
import Result from "./Result";
import ChildCard from "../../src/components/shared/ChildCard";
import UploadPopup from "./UploadPopup";
import { ref, getBytes } from "firebase/storage";
import { getDocument, GlobalWorkerOptions} from 'pdfjs-dist';
import axios from "axios";
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';

//Syllabus extracted sections - to be extracted by OS Parser 
interface SyllabusProps {
    course: string;
    credits: number;
    textbook: string;
    learningObjectives: string[];
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




  {/**Syllabus Form */}
const SyllabusForm: React.FC<SyllabusProps> = ({ course, credits, textbook, learningObjectives=[] }) => {
    return (
        <>
            {/* <Typography variant='h4'>Course</Typography> */}
            <CustomFormLabel htmlFor="bl-name" sx={{ mt: 0 }}>
                Course
            </CustomFormLabel>
            <Card>{course}</Card>
            <CustomFormLabel htmlFor="bl-name" sx={{ mt: 0 }}>
                Credits
            </CustomFormLabel>
            <Card>{credits}</Card>
            <CustomFormLabel htmlFor="bl-name" sx={{ mt: 0 }}>
                Textbook
            </CustomFormLabel>
            <Card>{textbook}</Card>
            <CustomFormLabel htmlFor="bl-name" sx={{ mt: 0 }}>
                Learning Objectives
            </CustomFormLabel>
            <Card>    
                <Typography component="ul">
                    {learningObjectives.map((item, index) => (
                        <Typography key={index} component="li" mt={index > 0 ? 1 : 0}>
                            {item}
                        </Typography>
                    ))}
                </Typography>
            </Card>
        </>
    );
};
{/**SyllabusComparison */}
const SyllabusComparison: React.FC<SyllabusProps> = ({ course, credits, textbook, learningObjectives}) => {
    const [displayText, setDisplayText] = useState('');
  
    const [extCourseName, setExtCourseName] = useState("");
    const [extCredits, setExtCredits] = useState(0);
    const [extTextbook, setExtTextbook ] = useState('');
        
    const [psuCourseName, setPsuCourseName] = useState("");
    const [psuCredits, setPsuCredits] = useState(0);
    const [psuTextbook, setPsuTextbook ] = useState('');

    const [sliderValues, setSliderValues] = useState([0, 0, 0]); // Initialize slider values
    const [open, setOpen] = useState(false); // Initialize dialog open state

    const [extFullText, setExtFullText] = useState('');
    const [psuFullText, setPsuFullText] = useState('');

    const [learningObjectivePercentages, setLearningObjectivePercentages] = useState<number[] | null>(null);

    const handleSliderChange = (index: number) => (event: any, newValue: number | number[]) => {
        const newSliderValues = [...sliderValues];
        newSliderValues[index] = newValue as number;
        setSliderValues(newSliderValues);
    };
   
    const router = useRouter();
  
    const { requestID } = router.query;
    const { userID } = router.query; 

    async function callLambdaFunction() {
        
        console.log("Inside lambda: PSU: " + psuFullText);
        console.log("Inside lambda: EXT: " + extFullText);
        console.log("weights:" + sliderValues);
        try {
            const response = await axios.post('https://6znwtk4i3u4vwgnri72ve7utre0uofio.lambda-url.us-east-1.on.aws/', {
                psuText: psuFullText,
                extText: extFullText,
                weights: sliderValues,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = response.data;
            console.log("Response from GPT:", data);
    
            const percentages = data.percentages;
            const temp = percentages.map((s: string) => parseFloat(s)*100);
            setLearningObjectivePercentages(temp);
        } catch (error) {
            console.error(`Error calling lambda function: ${error}`);
        }
    }

    const handleCompare = () => {
        const sum = sliderValues.reduce((a, b) => a + b, 0);
        if (sum !== 100) {
            setOpen(true);
        } else {
            callLambdaFunction();
            // setDisplayText('Comparison successful!');
            // router.push({
            //     pathname: 'comparison/Result',
            //     query: { sliderValues: JSON.stringify(sliderValues), requestID }
            //   }); 
            
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleExtractedData = (data: { course: any; credits: React.SetStateAction<number>; textbook: any; learningObjectives: any; fullText: string}) => {
        // Update the state or perform any other actions with the extracted data
        // For example:
        setPsuCourseName(data.course);
        if(Number.isNaN(data.credits) || data.credits === null){
            setPsuCredits(0);
        }else{
            setPsuCredits(data.credits);
        }
        
       // console.log("PSUTEXT", data.fullText);
        setPsuFullText(data.fullText);

        //console.log("PSUTEXT", psuFullText);
        if(data.textbook == null || data.textbook == "" || data.textbook == " "){
            setPsuTextbook("Not provided")
        }else{
            setPsuTextbook(data.textbook)

        
        }

        

        
       
      };
      

    useEffect(() => {
        const fetchSyllabusData = async () => {
            //console.log("HELLO???????????????")
            const { externalSyllabus } = router.query; //get the external syllabus from the query
                    
            //get the id from the query 
            if (externalSyllabus) {
              const syllabusDocRef = doc(db, externalSyllabus as string)
                      
              const syllabusDoc = await getDoc(syllabusDocRef);
              console.log(syllabusDoc)
              if (syllabusDoc.exists()) {
                const syllabusData = syllabusDoc.data() as DocumentData;
                const { CourseName, Credits } = syllabusData;
                setExtCourseName(CourseName);
                setExtCredits(Credits);
                const syllabusURLRef = syllabusData.SyllabusURL;
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
                        //console.log('Promise resolved. PDF:', pdf);

                        let extFullText = '';
                        // Loop through each page and extract text
                        for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);

                        // Extract the text content
                        const content = await page.getTextContent();

                        // Combine the text items into a single string
                        const text = content.items.map((item: { str: any }) => item.str).join(' ');
                        
                        extFullText += text + '\n';
                        //console.log(psuFullText);

                        }
                        setExtFullText(extFullText);
                        //console.log("EXTERNAL", extFullText)

                    
                    })
                }
                
              }
            }
          };
          
          fetchSyllabusData();
          }, [router.query]);
          

          
 
    return (
        <PageContainer>
            <h1>Syllabus Comparison</h1>
            <Grid container spacing={3} mt={3}>
                <Grid item xs={12} lg={6}>
                <ParentCard title="Penn State">
                <Box>
              <UploadPopup onExtractedData={handleExtractedData} requestID={requestID} userID={userID}/>
              <SyllabusForm
                course={psuCourseName}
                credits={psuCredits}
                textbook={psuTextbook}
                learningObjectives={learningObjectives}
              />
            </Box>
                </ParentCard>

                </Grid>
                <Grid item xs={12} lg={6}>
                <ParentCard title="External School">
                    <SyllabusForm course={extCourseName} credits={extCredits} textbook={textbook} learningObjectives={learningObjectives} />
                </ParentCard>
            </Grid>
            <Grid item xs={12} lg={16}>
                <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={5}>
                    <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flex={1}>
                    <Typography>{sliderValues[0]}</Typography>
                        <CustomRangeSlider min={0} max={100} step={5} value={sliderValues[0]} onChange={handleSliderChange(0)} />
                    </Box>
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
                    <Typography>{sliderValues[1]}</Typography>
                        <CustomRangeSlider min={0} max={100} step={5} value={sliderValues[1]} onChange={handleSliderChange(1)} />
                    </Box>
                    <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} flex={1}>
                    <Typography>{sliderValues[2]}</Typography>
                        <CustomRangeSlider min={0} max={100} step={5} value={sliderValues[2]} onChange={handleSliderChange(2)} />
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12} lg={16}>
                <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={5}>
                    <Box display={'flex'} justifyContent={'left'} alignItems={'left'} flex={1}>
                        <Typography>
                            Learning outcomes
                        </Typography>
                    </Box>
                    <Box display={'flex'} justifyContent={'left'} alignItems={'left'} flex={1}>
                        <Typography>
                            Textbook
                        </Typography>
                    </Box>
                    <Box display={'flex'} justifyContent={'left'} alignItems={'left'} flex={1}>
                        <Typography>
                            Grading scheme
                        </Typography>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12} mt={3} display="flex" justifyContent="center" alignItems="center">
                <Button variant="contained" component="span" onClick={handleCompare}>
                    Compare
                </Button>
              
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                {displayText && <Card>{displayText}</Card>}
            </Grid>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{"Error"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        The sum of all slider values must be exactly 1.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
      </PageContainer>
    );
};

export default SyllabusComparison;