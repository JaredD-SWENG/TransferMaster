
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
    const [extCourseName, setCourseName] = useState("");
    const [extCredits, setCredits] = useState(0);

    const [sliderValues, setSliderValues] = useState([0, 0, 0]); // Initialize slider values
    const [open, setOpen] = useState(false); // Initialize dialog open state

    const handleSliderChange = (index: number) => (event: any, newValue: number | number[]) => {
        const newSliderValues = [...sliderValues];
        newSliderValues[index] = newValue as number;
        setSliderValues(newSliderValues);
    };
   
    const router = useRouter();
  
    const handleCompare = () => {
        const sum = sliderValues.reduce((a, b) => a + b, 0);
        if (sum !== 100) {
            setOpen(true);
        } else {
            setDisplayText('Comparison successful!');
            router.push('./Result');
        }
    };

    const handleClose = () => {
        setOpen(false);
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
              setCourseName(CourseName);
              setCredits(Credits);
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
                    {/* <BasicLayout /> */}
                  <Box><UploadPopup/>
                    {/** */}
                    <SyllabusForm course={course} credits={credits} textbook={textbook} learningObjectives={learningObjectives} /></Box>
                   
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