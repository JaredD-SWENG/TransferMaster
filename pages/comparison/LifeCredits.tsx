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
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import CustomRangeSlider from "../../src/components/forms/theme-elements/CustomRangeSlider";
import { getDoc, DocumentData, doc, DocumentReference, query, collection, getDocs, where } from "firebase/firestore";
import { auth, db, storage } from "../../config/firebase";
import { ref, getBytes, getDownloadURL } from "firebase/storage";
import { getDocument, GlobalWorkerOptions} from 'pdfjs-dist';
import axios from "axios";
import LCResult from "./LCResult";
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';
import { useTheme } from '@mui/material/styles';
import {
    CardHeader,
    CardContent,
    Divider,
} from '@mui/material';
import { useSelector, AppState } from '../../src/store/Store';
import ExtUploadPopupPreeval from "./ExtUploadPopupPreeval";
import PsuUploadPopupPreeval from "./PsuUploadPopupPreeval";
import { styled } from '@mui/material/styles';
import ResumeUploadPopup from "./ResumeUploadPopup";
import HoverButton from "../ui-components/HoverButton";

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

type ParentCardProps = {
    title: string;
    onExtractedData: (data: any) => void;
    userID: string;
    footer?: string | JSX.Element;
    children?:JSX.Element;
};

type ResumeCardProps = {
    title: string;
    onExtractedData: (data: any) => void;
    userID: string;
}

const ParentCardPsuUpload: React.FC<ParentCardProps> = ({ title, onExtractedData, userID, footer, children }) => {
    //const customizer = useSelector((state: AppState) => state.customizer);
    const theme = useTheme();
    const borderColor = theme.palette.divider;
  
    return (
        <Card
            sx={{
                padding: 0,
                //border: !customizer.isCardShadow ? `1px solid ${borderColor}` : 'none',
            }}
            //elevation={customizer.isCardShadow ? 9 : 0}
            //variant={!customizer.isCardShadow ? 'outlined' : undefined}
        >
        <CardHeader
            title={
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1, }}>{title}</Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb:-4.3, mt:-1}}>
                        <PsuUploadPopupPreeval
                            onExtractedData={onExtractedData}
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

const ParentCardResumeUpload: React.FC<ResumeCardProps> = ({ title, onExtractedData, userID }) => {
    //const customizer = useSelector((state: AppState) => state.customizer);
  
    const theme = useTheme();
    const borderColor = theme.palette.divider;
  
    return (
        <Card
            sx={{
                padding: 0,
                //border: !customizer.isCardShadow ? `1px solid ${borderColor}` : 'none',
            }}
            //elevation={customizer.isCardShadow ? 9 : 0}
            //variant={!customizer.isCardShadow ? 'outlined' : undefined}
        >
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ flexGrow: 1 }}>{title}</Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: -4.3, mt: -1 }}>
                            <ResumeUploadPopup onExtractedData={onExtractedData} userID ={"ghost"} />
                        </Box>
                    </Box>
                }
            />
            <Divider />
        </Card>
    );
};


{/**SyllabusComparison */}
const LifeCredits: React.FC<SyllabusProps> = ({ course, credits, textbook, learningObjectives}) => {
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
    const [userID, setUserID] = useState('');
    const[showButtons, setShowButtons] = useState(true);

    const [loadingProgress, setLoadingProgress] = useState(0);

    //const [learningObjectivePercentages, setLearningObjectivePercentages] = useState<number[] | null>(null);

    const handleSliderChange = (index: number) => (event: any, newValue: number | number[]) => {
        const newSliderValues = [...sliderValues];
        newSliderValues[index] = newValue as number;
        setSliderValues(newSliderValues);
    };
   
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    //const [data, setData] = useState<any>('');
    let data: any;
    //const [percentages, setPercentages] = useState<number[]>([0, 0, 0]);

    async function callLambdaFunction() {
        setIsLoading(true);
        console.log("Inside lambda: PSU: " + psuFullText);
        console.log("Inside lambda: EXT: " + extFullText);
        try {
            const response = await axios.post('https://ubho2cbmax336g6ll6efz55nwi0iniar.lambda-url.us-east-1.on.aws/', {
                psuText: psuFullText,
                resumeText: extFullText,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response)
            data = response.data;
            console.log("Response from GPT:", data);
            setIsLoading(false);
    
            //const percentages = data.percentages;
            //const temp = percentages.map((s: string) => parseFloat(s)*100);
           
            learningObjectivePercentages = data.learning_objectives_percentages.map((value: number) => value * 100);
            setSyllabusComponents({
                score: data.final_score,
                learningObjectives: {
                    scores: data.learning_objectives_percentages,
                    score: data.final_score[0],
                    topics_summary: data.topics_covered_summary,
                    lo_summary: data.learning_objectives_summary
                },
                summary: data.general_summary
            })
            //console.log(learningObjectivePercentages);
        } catch (error) {
            console.error(`Error calling lambda function: ${error}`);
        }
       
        setShowCompare(true);
    }

    const cancelTokenRef = useRef<{} | null>(null);

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

    const handleCompare = () => {
        
        
            callLambdaFunction();
            
            // setDisplayText('Comparison successful!');
            // router.push({
            //     pathname: 'comparison/Result',
            //     query: { sliderValues: JSON.stringify(sliderValues), requestID }
            //   }); 
            
            console.log(syllabusComponents);
            setShowCompare(false);
            setShowResult(true);
        
    };

    const handleClose = () => {
        setOpen(false);
    };
    
    useEffect(() => {
        const fetchData = async () => {
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
                    const userData = userDoc.data();
                    if(userData.Role === "Student"){
                        setShowButtons(false);
                    } else {
                        setShowButtons(true);
                    }
                }
            }
        };
        fetchData();
    }, []);

    const handleExtExtractedData = (data: {  fullText: string, downloadUrl: string}) => {
        //set the extFullText
        setExtFullText(data.fullText);
        setExtDownloadUrl(data.downloadUrl);
    };
      
    const handlePsuExtractedData = (data: { course: any; credits: React.SetStateAction<number>; textbook: any; learningObjectives: any; fullText: string, downloadUrl: string}) => {
        // Update the state or perform any other actions with the extracted data
        // For example:
        console.log("in psu");
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
    };
       
    const [showCompare, setShowCompare] = useState(true);
    const [showResult, setShowResult] = useState(false);

    const [syllabusComponents, setSyllabusComponents] = useState<any>({'': ''});

    
    return (
        <PageContainer>
            <h1>Resume Comparison</h1>
            <Grid item xs={12} mt={3} mb={3}>
        {/* Use the HoverButton component here */}
        <HoverButton instructions="This is the Life Credits page.
        Upload a resume and a PSU syllabus to see how well your skills/experience
        match with a PSU course." />
      </Grid>
            <Grid container spacing={3} mt={3}>
                <Grid item xs={12} lg={6}>
                <ParentCardPsuUpload title="Penn State" onExtractedData={handlePsuExtractedData} userID={userID}>
                    <SyllabusForm
                        course={psuCourseName}
                        credits={psuCredits}
                        textbook={psuTextbook}
                        learningObjectives={psuObjectives}
                    />
                    </ParentCardPsuUpload>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <ParentCardResumeUpload title="Resume" onExtractedData={handleExtExtractedData} userID={userID}></ParentCardResumeUpload>
                </Grid>
                {/* <Grid item xs={12} lg={16}>
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
                </Grid> */}
                {/* <Grid item xs={12} lg={16}>
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
                </Grid> */}
                <Grid item xs={12} mt={3} display="flex" justifyContent="center" alignItems="center">
                    {showCompare && (
                        <Button variant="contained" component="span" onClick={handleCompare}>
                            Compare
                        </Button>
                    )}
                    {isLoading && (
                        <Box sx={{ width: "100%", mt: 2 }}>
                            <CustomLinearProgress variant="determinate" value={loadingProgress} />
                        </Box>
                    )}
                </Grid>
            </Grid>
            {/* Approve/Reject button should be disabled for students: could try passing in the role and disable the button if role==student*/}
            {!isLoading && showResult && (
                <LCResult syllabusComponents={syllabusComponents} psuUrl={psuDownloadUrl} extUrl={extDownloadUrl} showButtons={showButtons} />
            )}
        </PageContainer>
    );
};

export default LifeCredits;