// ChatBox.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Button,
} from "@mui/material";

// Define the custom styles using the SxProps type
const chatStyles: Record<string, React.CSSProperties> = {
  chatMessagesContainer: {
    display: "flex",
    flexDirection: "column",
  },
  chatBubble: {
    backgroundColor: "#4caf50",
    color: "#fff",
    maxWidth: "70%",
    padding: "10px 16px",
    borderRadius: "16px",
    margin: "8px",
    alignSelf: "flex-end",
  },
  userChatBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#007bff",
  },
};

interface ChatBoxProps {
  open: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  chatHistory: string[];
}

const ChatBox: React.FC<ChatBoxProps> = ({
  open,
  onClose,
  onSendMessage,
  chatHistory,
}) => {
  const [message, setMessage] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    onSendMessage(message);
    setMessage("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Chat with Syllabus</DialogTitle>
      <DialogContent>
        {/* Render chat messages */}
        <Box sx={chatStyles.chatMessagesContainer} mb={2}>
          {chatHistory?.map((msg, index) => (
            <div
              key={index}
              style={
                index % 2 === 0
                  ? chatStyles.chatBubble
                  : { ...chatStyles.chatBubble, ...chatStyles.userChatBubble }
              }
            >
              {msg}
            </div>
          ))}
        </Box>

        {/* Input field for typing messages */}
        <TextField
          autoFocus
          margin="dense"
          label="Type your message"
          fullWidth
          variant="outlined"
          value={message}
          onChange={handleChange}
        />
      </DialogContent>
      <Box display="flex" justifyContent="flex-end" p={2}>
        <Button onClick={handleSendMessage} variant="contained" color="primary">
          Send
        </Button>
      </Box>
    </Dialog>
  );
};

export default ChatBox;
