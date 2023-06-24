import { 
    Button,
    Box,
    Dialog,
    DialogTitle,
    Slide,
    DialogActions,
    Grid,
    Input} from "@mui/material";
import React, { ReactElement } from "react";
import { useRouter } from "next/router";
import { TransitionProps } from '@mui/material/transitions';
import CustomNextPage from "../../types/custom";
import withRole from "../../src/components/hocs/withRole";
import FullLayout from "../../src/layouts/full/FullLayout";

//Syllabus extracted sections - to be extracted by OS Parser 
interface SyllabusProps {
    course: string;
    credits: number;
    textbook: string;
    learningObjectives: string[];
}
{/**Transitions */}
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
  
  
const UploadPopup: CustomNextPage = () => {
  const router = useRouter();


  const handleExistingFilBtn = () => {
      router.push('/my-uploads')
  };

  {/** */}
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleUploadBtnClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
      <Box>
      <Grid mb={4}>
      <Button variant="contained" component="span" onClick={handleUploadBtnClick}>
      Upload File
      </Button>
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
          Upload File
          </DialogTitle>
          {/** Anything on the dialog box should be in result.tsx page */}
          <Grid m={4}>
          <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
          <Grid m={4}>
              <Input
                  type="file"
                  style={{ display: 'none' }}
                  id="file-upload"
              />
              <label htmlFor="file-upload">
                  <Button variant="contained" component="span">
                  Upload New
                  </Button>
              </label>
              </Grid>
              </Box> 
              
              <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
              <Grid m={2}>
                      or
              
              </Grid>
              </Box>



              <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
              <Grid m={4}>
              <Button onClick={handleExistingFilBtn} color="secondary" variant="contained">
                  Choose from existing files
              </Button>
      </Grid>
      </Box>
              
              
              
          </Grid>
          

      {/**Upload Btn Actions */}
          <DialogActions>
          
          </DialogActions>
      </Dialog>
      </Grid>
      </Box>  
  );
};

UploadPopup.getLayout = function getLayout(page: ReactElement) {
    return <FullLayout>{page}</FullLayout>;
};

export default withRole({ Component: UploadPopup, roles: ['Reviewer', 'Transfer Specialist'] });