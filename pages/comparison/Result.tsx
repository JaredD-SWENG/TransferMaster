import PageContainer from "../../src/components/container/PageContainer";
import dynamic from "next/dynamic";
import React, { ReactElement, useState } from 'react';
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
    Grid,
    Typography,
    IconButton
} from '@mui/material';
import CustomFormLabel from '../../src/components/forms/theme-elements/CustomFormLabel';
import { TransitionProps } from '@mui/material/transitions';
import withRole from "../../src/components/hocs/withRole";
import FullLayout from "../../src/layouts/full/FullLayout";
import CustomNextPage from "../../types/custom";
import router from "next/router";
import { IconSend } from "@tabler/icons-react";
const DynamicBarChart = dynamic(() => import('./BarChart'), { ssr: false });

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

//diplay comparison metrics like graph, summary, etc. 
const Result: CustomNextPage = () => {
    const syllabusComponents : any = {
        score: 73.68,
        learningObjectives: {
            objectives: [
                'Want to sell your soul',
                'Learn calculus 2',
                'Cry many tears',
                'Fill out pieces of paper worth a small forest with problem questions or use up all your storage space'
            ],
            scores: [15, 60, 25, 85],
            score: 30,
            summary: [
                'Soul was mentioned but it was probably "soul enriching" so nope',
                'There was learning and calculus so ::thumbs up::',
                'Crying was involved',
                'This essentially points to lots of practice work and there definitely is a lot of that although no wastage is expected'
            ]
        },
        textbook: {
            title: 'Calculus 2',
            author: 'Manasi Patil',
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
    };

    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleClickMessage = () => {
    
        router.push('/apps/chats')
    };
    return (
        <PageContainer>
            <h1>Comparison Results</h1>
            <Grid item xs={12} mt={3} display="flex" justifyContent="right" alignItems="center">
                <Button variant="contained" component="span" onClick={handleClickMessage}>
                <IconButton>
          <IconSend stroke={1.5} color="white" size="20" />
        </IconButton>
                    Chat with syllabus
                </Button>
              
            </Grid>
            <Typography mt={6}>
                <DynamicBarChart syllabusComponents={syllabusComponents} />
            </Typography>
            <Box mt={3}>
                <Grid item xs={12} lg={16}>
                    <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={5}>
                        <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flex={1}>
                            <Button variant="contained"  color="primary" onClick={handleClickOpen}>
                                Approve
                            </Button>
                        </Box>
                        <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} flex={1}>
                            <Button variant="contained"  color="error" onClick={handleClickOpen}>
                                Deny
                            </Button>
                        </Box>
                    </Box>
                </Grid>
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
                        Add Comment
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description" component="div">
                            <CustomFormLabel htmlFor="message-text">Message</CustomFormLabel>
                            <TextField
                                id="message-text"
                                placeholder="Write a message"
                                multiline
                                fullWidth
                                rows={4}
                                variant="outlined"
                            />
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flex={1} ml={2}>
                            <Button onClick={handleClose} color="primary" variant="contained">
                                Submit
                            </Button>    
                        </Box>
                        <Button onClick={handleClose} color="secondary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </PageContainer>
    );
};

Result.getLayout = function getLayout(page: ReactElement) {
    return <FullLayout>{page}</FullLayout>;
};

export default withRole({ Component: Result, roles: ['Reviewer', 'Transfer Specialist'] });