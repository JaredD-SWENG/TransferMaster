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
    LinearProgress,} from "@mui/material";
import ParentCard from "../../src/components/shared/ParentCard";
import PageContainer from "../../src/components/container/PageContainer";
import CustomFormLabel from "../../src/components/forms/theme-elements/CustomFormLabel";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CustomRangeSlider from "../../src/components/forms/theme-elements/CustomRangeSlider";
import { getDoc, DocumentData, doc, DocumentReference } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import UploadPopup from "./UploadPopup";
import { ref, getBytes, getDownloadURL } from "firebase/storage";
import { getDocument, GlobalWorkerOptions} from 'pdfjs-dist';
import axios from "axios";
import Result from "./Result";
//import Result from "./ResultOld";
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';

import { useTheme } from '@mui/material/styles';
import {
  CardHeader,
  CardContent,
  Divider,
} from '@mui/material';
import { useSelector, AppState } from '../../src/store/Store';
import { styled } from '@mui/material/styles';

const CustomLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10, // Adjust the height to make the loading bar thicker
    borderRadius: 5, // Add some border radius for a rounded appearance
    backgroundColor: theme.palette.grey[300], // Change the background color
    '& .MuiLinearProgress-bar': {
      borderRadius: 5, // Add border radius for the progress bar
      backgroundColor: theme.palette.primary.main, // Change the progress bar color
    },
  }));
  

type Props = {
  title: string;
  footer?: string | JSX.Element;
  children: JSX.Element;
  
};


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

let learningObjectivePercentages: number[];

{/**SyllabusComparison */}
const SyllabusComparison: React.FC<SyllabusProps> = ({ course, credits, textbook, learningObjectives}) => {
    const [displayText, setDisplayText] = useState('');
  
    const [extCourseName, setExtCourseName] = useState("");
    const [extCredits, setExtCredits] = useState(0);
    const [extTextbook, setExtTextbook ] = useState('');
    const [extObjectives, setExtObjectives ] = useState([]);
    const [extDownloadUrl, setExtDownloadUrl] = useState('');
            
    const [psuCourseName, setPsuCourseName] = useState("");
    const [psuCredits, setPsuCredits] = useState(0);
    const [psuTextbook, setPsuTextbook ] = useState('');
    const [psuObjectives, setPsuObjectives] = useState([]);
    const [psuDownloadUrl, setPsuDownloadUrl] = useState('');
    
    const [sliderValues, setSliderValues] = useState([0, 0, 0]); // Initialize slider values
    const [open, setOpen] = useState(false); // Initialize dialog open state

    const [extFullText, setExtFullText] = useState('');
    const [psuFullText, setPsuFullText] = useState('');
    

    const [loadingProgress, setLoadingProgress] = useState(0);

    //const [learningObjectivePercentages, setLearningObjectivePercentages] = useState<number[] | null>(null);

    const handleSliderChange = (index: number) => (event: any, newValue: number | number[]) => {
        const newSliderValues = [...sliderValues];
        newSliderValues[index] = newValue as number;
        setSliderValues(newSliderValues);
    };
   
    const router = useRouter();
  
    const { requestID } = router.query;
    const { userID } = router.query; 

    const [isLoading, setIsLoading] = useState(false);

    //const [data, setData] = useState<any>('');
    let data: any;
    //const [percentages, setPercentages] = useState<number[]>([0, 0, 0]);

    async function callLambdaFunction() {
        setIsLoading(true);
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
            console.log(response)
            data = response.data;
            console.log("Response from GPT:", data);
    
            //const percentages = data.percentages;
            //const temp = percentages.map((s: string) => parseFloat(s)*100);
            if (data) {
                console.log(data.learning_objectives_percentages)
                //setPercentages(
                let percentages: number[] = data.learning_objectives_percentages.map((value: number) => value * 100);
                console.log(percentages)
                learningObjectivePercentages = data.learning_objectives_percentages.map((value: number) => value * 100);
                setSyllabusComponents({
                    score: data.final_score,
                    learningObjectives: {
                        objectives: [
                            'Want to sell your soul',
                            'Learn calculus 2',
                            'Cry many tears',
                            'Fill out pieces of paper worth a small forest with problem questions or use up all your storage space'
                        ],
                        scores: data.learning_objectives_percentages,
                        score: data.overall_match[0],
                        summary: data.learning_objectives_summary
                    },
                    textbook: {
                        psuTextbook: psuTextbook,
                        extTextbook: extTextbook,
                        score: data.overall_match[1],
                        summary: data.textbook_summary
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
                        score: data.overall_match[2],
                        summary: data.grading_criteria_summary
                    }
                })
            }
            console.log(learningObjectivePercentages);
            // Simulate loading progress (you can replace this with actual progress updates if you have them)
        } catch (error) {
            console.error(`Error calling lambda function: ${error}`);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if (isLoading) {
          const simulateProgress = async () => {
            for (let i = 1; i <= 100; i += 1) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              setLoadingProgress(i);
            }
            setLoadingProgress(100);
          };
          simulateProgress();
        }
      }, [isLoading]);

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
            
            console.log(syllabusComponents);
            setShowCompare(false);
            setShowResult(true);
           
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    
    const handleExtractedData = (data: { course: any; credits: React.SetStateAction<number>; textbook: any; learningObjectives: any; fullText: string, downloadUrl: string}) => {
        // Update the state or perform any other actions with the extracted data
        // For example:
        setPsuCourseName(data.course);
        if (Number.isNaN(data.credits) || data.credits === null) {
            setPsuCredits(0);
        } else {
            setPsuCredits(data.credits);
        }
        
       // console.log("PSUTEXT", data.fullText);
        setPsuFullText(data.fullText);

        //console.log("PSUTEXT", psuFullText);
        if (data.textbook == null || data.textbook == "" || data.textbook == " ") {
            setPsuTextbook("Not provided")
        } else {
            setPsuTextbook(data.textbook);
        }

       
        setPsuObjectives(data.learningObjectives);
        setPsuDownloadUrl(data.downloadUrl);
        //console.log("PSU URL: " + data.downloadUrl);
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
                    const { CourseName, Credits, Textbook, Objectives, IsSelectable, OCRContent } = syllabusData;
                    setExtCourseName(CourseName);
                    setExtCredits(Credits);
                    setExtTextbook(Textbook);
                    setExtObjectives(Objectives);
                    const syllabusURLRef = syllabusData.SyllabusURL;
                    const syllabusURLDocSnapshot = await getDoc(syllabusURLRef);

                    
                    if (syllabusURLDocSnapshot.exists()) {
                        let syllabusURLDocData = syllabusURLDocSnapshot.data() as SyllabusURLDoc;
                        let storageFileURL = syllabusURLDocData.fileUrl;
                        const fileRef = ref(storage, storageFileURL);
                        const fileBytes = await getBytes(fileRef);
                        const downloadUrl = await getDownloadURL(fileRef);
                        setExtDownloadUrl(downloadUrl);
                        
                        if(IsSelectable){
                        const loadingTask = getDocument({ data: fileBytes });
                        const pdf = await loadingTask.promise;

                        loadingTask.promise
                        .then(async (pdf: { numPages: number; getPage: (arg0: number) => any }) => {
                            //console.log('Promise resolved. PDF:', pdf);

                            let extFullText = '';
                            // Loop through each page and extract text
                            for (let i = 1; i <= Math.min(5, pdf.numPages); i++) {
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
                    }else{
                        setExtFullText(OCRContent);
                    }
                    }

                }
            }
        }; 
        fetchSyllabusData();
    }, [router.query]);
       
    const [showCompare, setShowCompare] = useState(true);
    const [showResult, setShowResult] = useState(false);

    const [syllabusComponents, setSyllabusComponents] = useState<any>({
        score: 73.68,
        learningObjectives: {
            objectives: [
                'Want to sell your soul',
                'Learn calculus 2',
                'Cry many tears',
                'Fill out pieces of paper worth a small forest with problem questions or use up all your storage space'
            ],
            scores: [20, 45, 35],
            score: 30,
            summary: [
                'Soul was mentioned but it was probably "soul enriching" so nope',
                'There was learning and calculus so ::thumbs up::',
                'Crying was involved',
                'This essentially points to lots of practice work and there definitely is a lot of that although no wastage is expected'
            ]
        },
        extTextbook: {
            title: 'Calculus 2',
            score: 100,
            summary: 'This book is the exact same as the other one since no one can resist books written by Manasi Patil.'
        },
        psuTextbook: {
            title: 'Calculus 2',
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
    });


    //here
    const ParentCardUpload = ({ title, children, footer }: Props) => {
        const customizer = useSelector((state: AppState) => state.customizer);
      
        const theme = useTheme();
        const borderColor = theme.palette.divider;
      
        return (
          <Card
            sx={{
              padding: 0,
              border: !customizer.isCardShadow ? `1px solid ${borderColor}` : 'none',
            }}
            elevation={customizer.isCardShadow ? 9 : 0}
            variant={!customizer.isCardShadow ? 'outlined' : undefined}
          >
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{ flexGrow: 1, }}>{title}</Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb:-4.3, mt:-1}}>
                    <UploadPopup
                      onExtractedData={handleExtractedData}
                      requestID={requestID}
                      userID={userID}
                    />
                  </Box>
                </Box>
              }
              
            />
            <Divider />
      
            <CardContent>{children}</CardContent>
            {footer ? (
              <>
                <Divider />
                <Box p={3}>{footer}</Box>
              </>
            ) : (
              ''
            )}
          </Card>
        );
      };
      

    return (
        <PageContainer>
            <h1>Syllabus Comparison</h1>
            <Grid container spacing={3} mt={3}>
                <Grid item xs={12} lg={6}>
                    <ParentCardUpload title="Penn State">
                            <SyllabusForm
                                course={psuCourseName}
                                credits={psuCredits}
                                textbook={psuTextbook}
                                learningObjectives={psuObjectives}
                            />
                    </ParentCardUpload>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <ParentCard title="External School">
                        <SyllabusForm
                            course={extCourseName}
                            credits={extCredits}
                            textbook={extTextbook}
                            learningObjectives={extObjectives}
                        />
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
                    {showCompare && (
                        <Button variant="contained" component="span" onClick={handleCompare} disabled={isLoading}>
                            Compare
                        </Button>
                    )}
                    {isLoading && (
      <Box sx={{ width: "100%", mt: 2 }}>
        <CustomLinearProgress variant="determinate" value={loadingProgress} />
      </Box>
    )}
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="center" alignItems="center">
                    {displayText && <Card>{displayText}</Card>}
                </Grid>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>{"Error"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            The sum of all slider values must be exactly 100.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
            {!isLoading && showResult && (
                <Result syllabusComponents={syllabusComponents} psuUrl={psuDownloadUrl} extUrl={extDownloadUrl} />
            )}
        </PageContainer>
    );
};

export default SyllabusComparison;