import { Typography, Grid, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box, TextField, Slide, IconButton } from "@mui/material";
import PageContainer from "../../src/components/container/PageContainer";
import CustomFormLabel from "../../src/components/forms/theme-elements/CustomFormLabel";
import withRole from "../../src/components/hocs/withRole";
import CustomNextPage from "../../types/custom";
import dynamic from "next/dynamic";
import { useState } from "react";
import React from "react";
import { TransitionProps } from "@mui/material/transitions";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import router from "next/router";
import { IconSend } from "@tabler/icons-react";

interface ResultProps {
    syllabusComponents: any;
}

const Result: React.FC<ResultProps> & CustomNextPage<ResultProps> = ({syllabusComponents}) => {
    const [status, setStatus] = useState('');
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    
    const DynamicBarChart = dynamic(() => import('./BarChart'), { ssr: false });
    // const Transition = React.forwardRef(function Transition(
    //     props: TransitionProps & {
    //       children: React.ReactElement<any, any>;
    //     },
    //     ref: React.Ref<unknown>,
    // ) {
    //     return <Slide direction="up" ref={ref} {...props} />;
    // });
    const requestID = router.query.requestID as string;

    const handleApproveClickOpen = () => {
        setStatus("Approved");
        setOpen(true);
    };
    const handleRejectClickOpen = () => {
        setStatus("Rejected");
        setOpen(true);
    };
    const handleClose = () => {
        console.log("message:", message);
        console.log("status:", status)

        let requestDocRef = doc(db, 'Requests', requestID as string); // Replace 'YourCollectionName' with your actual collection name
        updateDoc(requestDocRef, {
            Comments: message ,
            Status: status
        });
        setOpen(false);
    };
    const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setMessage(event.target.value);
    };
    const handleClickMessage = () => {
        console.log('inside handleClickMessage')
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
            {/*</PageContainer>{learningObjectivePercentages && (*/}
                <Typography mt={6}>
                    <DynamicBarChart syllabusComponents={syllabusComponents} />
                </Typography>
            {/*)}*/}
            <Box mt={3}>
                <Grid item xs={12} lg={16}>
                    <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={5}>
                        <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flex={1}>
                            <Button variant="contained"  color="primary" onClick={handleApproveClickOpen}>
                                Approve
                            </Button>
                        </Box>
                        <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} flex={1}>
                            <Button variant="contained"  color="error" onClick={handleRejectClickOpen}>
                                Deny
                            </Button>
                        </Box>
                    </Box>
                </Grid>
                <Dialog
                    open={open}
                    // TransitionComponent={Transition}
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
                                value={message}
                                onChange={handleChange}
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

export default withRole({ Component: Result, roles: ['Reviewer', 'Transfer Specialist'] });