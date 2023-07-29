// ChatBox.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Button,
} from "@mui/material";

// Define the custom styles using the CSSProperties type
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
  typingBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#dcdcdc",
    maxWidth: "70%",
    padding: "10px 16px",
    borderRadius: "16px",
    margin: "8px",
    display: "inline-block",
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
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setIsSending(false); // Reset isSending when the chat box is opened again
    setMessage(""); // Clear the input field when the chat box is opened again
  }, [open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    if (message.trim() !== "") {
      setIsSending(true);
      await onSendMessage(message);
      setMessage("");
      setIsSending(false);
    }
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
          {/* Show typing bubbles while the bot is processing */}
          {isSending && <div style={chatStyles.typingBubble}>...</div>}
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
        <Button
          onClick={handleSendMessage}
          variant="contained"
          color="primary"
          disabled={isSending}
        >
          Send
        </Button>
      </Box>
    </Dialog>
  );
};

export default ChatBox;
