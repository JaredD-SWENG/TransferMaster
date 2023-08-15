import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  Slide,
  DialogActions,
  Grid,
  Input,
  TextField,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  Checkbox,
  Radio,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import axios from "axios";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { getBytes, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage, auth } from "../../config/firebase";
import {
  query,
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  where,
  getDocs,
  DocumentReference,
} from "firebase/firestore";
import { dispatch, useDispatch, useSelector } from "../../src/store/Store";
import {
  SearchTicket,
  fetchTickets,
} from "../../src/store/apps/tickets/TicketSlice";
import tickets from "../apps/tickets";
import { TicketType } from "../../src/types/apps/ticket";
GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js";

// Syllabus extracted sections - to be extracted by OS Parser
interface SyllabusProps {
  fullText: string;
  downloadUrl: string;
}

interface UploadPopupProps {
  userID: string;
  onExtractedData: (data: SyllabusProps) => void;
}

// Transitions
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ResumeUploadPopup: React.FC<UploadPopupProps> = ({
  onExtractedData,
  userID,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [isSelectable, setIsSectable] = useState(true);
  const [OCRContent, setOCRContent] = useState<string>("");
  const [fileBytes, setFileBytes] = useState<ArrayBuffer>();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [plsWork, setPlsWork] = useState<string>("");

  //--------------------------------------------------------------

  const handleExtUploadBtnClick = (event: any) => {
    console.log("EXT SET ANCHOR--------------------------");
    setAnchorEl(event.currentTarget);
    setPlsWork("hi");
    //handleExtFileSelect(event);
  };

  async function callOCRCheck(fileURL: string) {
    console.log("file url: " + fileURL);
    try {
      const response = await axios.post(
        "https://o6utjsi2fp4nhvr4mojyypwgu40aspyt.lambda-url.us-east-1.on.aws/",
        {
          PdfUrl: fileURL,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
      const data = response.data;
      return data;
    } catch (error) {
      console.error(`Error calling lambda function: ${error}`);
      return "Error calling";
    }
  }

  const handleExtFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    console.log("EXT FILE SELECT--------------------------");
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      try {
        setLoading(true);
        //Create a reference to firebase storage and store the uploaded file in /uploads
        const storageRef = ref(storage, "uploads/" + file.name);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(
          ref(storage, storageRef.fullPath)
        );
        setDownloadUrl(downloadUrl);
        //call to OCR:  callOCRCheck(downloadUrl)
        const ocrCheck = await callOCRCheck(downloadUrl);

        let fileData = new Uint8Array();
        let bytes = new ArrayBuffer(0);
        //IF NOT SELECTABLE
        if (ocrCheck.isSelectable == false) {
          setIsSectable(ocrCheck.isSelectable);
          setOCRContent(ocrCheck.fileContent);
          let encoder = new TextEncoder();
          fileData = encoder.encode(ocrCheck.fileContent);
          console.log("IS NOT SELECTABLE fileData", fileData);
        } else {
          const fileBytes = await file.arrayBuffer();
          bytes = fileBytes;
          //setFileBytes(fileBytes);

          console.log("filebytes", bytes);
          // Convert the ArrayBuffer to a Uint8Array for sending as binary data in the API request
          fileData = new Uint8Array(bytes);

          console.log("IS SELECTABLE filedata", fileData);
        }

        if (ocrCheck.isSelectable == true) {
          // Load the PDF document from the bytes
          // Load the PDF document from the bytes
          const loadingTask = getDocument({ data: bytes });
          console.log("loadingTask:", loadingTask);

          loadingTask.promise
            .then(
              async (pdf: {
                numPages: number;
                getPage: (arg0: number) => any;
              }) => {
                console.log("Promise resolved. PDF:", pdf);
                let fullText = "";

                // Loop through each page and extract text
                for (let i = 1; i <= Math.min(5, pdf.numPages); i++) {
                  const page = await pdf.getPage(i);

                  // Extract the text content
                  const content = await page.getTextContent();

                  // Combine the text items into a single string
                  const text = content.items
                    .map((item: { str: any }) => item.str)
                    .join(" ");

                  fullText += text + "\n";
                }

                const user = auth.currentUser;

                console.log("INSIDE POPUP: " + downloadUrl);
                // Create the extracted data object
                const extractedData: SyllabusProps = {
                  fullText: fullText,
                  downloadUrl: downloadUrl,
                };

                // Call the onExtractedData callback function with the extracted data
                onExtractedData(extractedData);
              }
            )
            .catch((error: any) => {
              console.error("Error loading PDF:", error);
            });
        } else {
          const fullText = ocrCheck.fileContent;

          const user = auth.currentUser;

          const extractedData: SyllabusProps = {
            downloadUrl: downloadUrl,
            fullText: fullText,
          };

          // Call the onExtractedData callback function with the extracted data
          onExtractedData(extractedData);
        }
        handleExtClose(); // Close the popup here
      } catch (error) {
        console.error("Failed to parse document:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExtClose = () => {
    setAnchorEl(null);
  };

  //MyUploads code--------------------------------------------------------------

  //--------------------------------------------------------------

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const getVisibleTickets = (
    tickets: TicketType[],
    filter: string,
    ticketSearch: string
  ) => {
    switch (filter) {
      case "total_tickets":
        return tickets.filter(
          (c) =>
            !c.deleted &&
            c.ticketTitle.toLocaleLowerCase().includes(ticketSearch)
        );

      case "Pending":
        return tickets.filter(
          (c) =>
            !c.deleted &&
            c.Status === "Pending" &&
            c.ticketTitle.toLocaleLowerCase().includes(ticketSearch)
        );

      case "Closed":
        return tickets.filter(
          (c) =>
            !c.deleted &&
            c.Status === "Closed" &&
            c.ticketTitle.toLocaleLowerCase().includes(ticketSearch)
        );

      case "Open":
        return tickets.filter(
          (c) =>
            !c.deleted &&
            c.Status === "Open" &&
            c.ticketTitle.toLocaleLowerCase().includes(ticketSearch)
        );

      default:
        throw new Error(`Unknown filter: ${filter}`);
    }
  };

  const tickets = useSelector((state) =>
    getVisibleTickets(
      state.ticketReducer.tickets,
      state.ticketReducer.currentFilter,
      state.ticketReducer.ticketSearch
    )
  );

  return (
    <Box>
      <Grid mb={4}>
        <Button
          variant="contained"
          component="span"
          onClick={handleExtUploadBtnClick}
        >
          Upload File
        </Button>
        <Dialog
          open={open}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleExtClose}
          fullWidth
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title" variant="h5">
            Upload File
          </DialogTitle>
          <Grid m={4}>
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              flex={1}
            >
              <Grid m={4}>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <>
                    <Input
                      type="file"
                      style={{ display: "none" }}
                      id="file-upload-ext"
                      onChange={handleExtFileSelect}
                    />
                    <label htmlFor="file-upload-ext">
                      <Button variant="contained" component="span">
                        Upload New
                      </Button>
                    </label>
                  </>
                )}
              </Grid>
            </Box>
          </Grid>
        </Dialog>
      </Grid>
    </Box>
  );
};

export default ResumeUploadPopup;
