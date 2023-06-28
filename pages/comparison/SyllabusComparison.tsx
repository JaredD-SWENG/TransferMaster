
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
import { getDoc, DocumentData, doc } from "firebase/firestore";
import { db } from "../../config/firebase";

import { TransitionProps } from '@mui/material/transitions';
import Result from "./Result";
import ChildCard from "../../src/components/shared/ChildCard";
import UploadPopup from "./UploadPopup";
//Syllabus extracted sections - to be extracted by OS Parser 
interface SyllabusProps {
    course: string;
    credits: number;
    textbook: string;
    learningObjectives: string[];
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
    const router = useRouter();
  
    const handleCompare = () => {
        setDisplayText('Comparison successful!');
        router.push('comparison/Result')
    };

    const handleExtractedData = (data: { course: any; credits: React.SetStateAction<number>; textbook: any; learningObjectives: any; }) => {
        // Update the state or perform any other actions with the extracted data
        // For example:
        setPsuCourseName(data.course);
        setPsuCredits(data.credits);

        if(data.textbook === null){
            setPsuTextbook("Not provided")
        }else{
            setPsuTextbook(data.textbook)
        }
        
       
      };
      

    useEffect(() => {
        const fetchSyllabusData = async () => {
          const { externalSyllabus } = router.query;
          if (externalSyllabus) {
            const syllabusDocRef = doc(db, externalSyllabus as string);
            const syllabusDoc = await getDoc(syllabusDocRef);
            if (syllabusDoc.exists()) {
              const syllabusData = syllabusDoc.data() as DocumentData;
              const { CourseName, Credits } = syllabusData;
              setExtCourseName(CourseName);
              setExtCredits(Credits);
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
              <UploadPopup onExtractedData={handleExtractedData} />
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
                        <CustomRangeSlider />
                    </Box>
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
                        <CustomRangeSlider />
                    </Box>
                    <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} flex={1}>
                        <CustomRangeSlider />
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
        </Grid>
      </PageContainer>
    );
};

export default SyllabusComparison;