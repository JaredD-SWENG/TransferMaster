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
import { useRouter } from "next/router";
import { IconSend } from "@tabler/icons-react";
import axios from "axios";
import ChatBox from "./ChatBox";



interface ResultProps {
    syllabusComponents: any;
    psuUrl: string,
    extUrl: string,
    showButtons: boolean, 
}

const LCResult: React.FC<ResultProps> & CustomNextPage<ResultProps> = ({syllabusComponents, psuUrl, extUrl, showButtons}) => {
    const [status, setStatus] = useState('');
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [openChat, setOpenChat] = useState(false);
    const [chatHistory, setChatHistory] = useState<string[]>([]);

    const handleOpenChat = () => {
        setOpenChat(true);
    };
    
    const handleCloseChat = () => {
        setOpenChat(false);
    };

    const handleSendMessage = async (message: string) => {
        // Display the message in the chatbox
        addToChatHistory(` ${message}`);
    
        // Call the chatBot function passing in the message
        const response = await callChatbot(message);
        // Display the answer in the chatbox
        addToChatHistory(`${response}`);
    };
    
    const addToChatHistory = (msg: string) => {
        setChatHistory((prevHistory) => [...prevHistory, msg]);
    };
    
    const DynamicBarChart = dynamic(() => import('./LCBarChart'), { ssr: false });
    const router = useRouter();
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
        console.log('dumb')
    };

    async function callChatbot(inputQuestion:string) {
        console.log("psu: " + psuUrl);
        console.log("ext: " + extUrl);
        try {
            const response = await axios.post('https://uubvngwolz7s5nfuregjlgmrmy0kwpfk.lambda-url.us-east-1.on.aws/', {
                psuURL: psuUrl,
                extURL: extUrl,
                question: inputQuestion,
                usingResume: true
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(response)
            const answer = response.data;
            console.log("Response from GPT:", answer);
            return answer;
    
        } catch (error) {
          console.error(`Error calling lambda function: ${error}`);
          return "Error calling";
        }
    }


    return (
        <PageContainer>
            <h1>Comparison Results</h1>
            <Grid item xs={12} mt={3} display="flex" justifyContent="right" alignItems="center">
                <Button variant="contained" component="span" onClick={handleOpenChat}>
                    Chat with syllabus
                </Button>
                <ChatBox
                    open={openChat}
                    onClose={handleCloseChat}
                    onSendMessage={handleSendMessage}
                    chatHistory={chatHistory}
                />
            </Grid>
            <Typography mt={6}>
                <DynamicBarChart syllabusComponents={syllabusComponents} />
            </Typography>
            <Box mt={3}>
                <Grid item xs={12} lg={16}>
                    <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={5}>
                        <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flex={1}>
                            {showButtons && (
                                <Button variant="contained"  color="primary" onClick={handleApproveClickOpen}>
                                    Approve
                                </Button>
                            )}
                        </Box>
                        <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} flex={1}>
                            {showButtons && (
                                <Button variant="contained"  color="error" onClick={handleRejectClickOpen}>
                                    Deny
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Grid>
                <Dialog
                    open={open}
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

export default LCResult;