import { Grid, InputAdornment, Button, Input, Card } from '@mui/material';
import CustomTextField from '../../src/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../src/components/forms/theme-elements/CustomFormLabel';
import ComboBoxAutocomplete from '../../src/components/forms/form-elements/autoComplete/ComboBoxAutocomplete';
import { useRouter } from "next/router";
import { useState } from 'react';

const StudentDashboard = () => {
  const router = useRouter();
  const [displayText, setDisplayText] = useState('');
  
  const handleSubmit = () => {
    setDisplayText('Request submitted');
    router.push('../dashboards/student');
  };

  return (
    <Grid container>
      {/* 1 */}
      <Grid item xs={12} mt={3}>
        <Input
          type="file"
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="contained" component="span">
            Upload File
          </Button>
        </label>
      </Grid>      
      {/* 2 */}
      <Grid item xs={12} display="flex" alignItems="center" sx={{ mt: 3 }}>
        <CustomFormLabel htmlFor="institution" sx={{ mt: 0 }}>
          Institution Name
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12}>
        <CustomTextField id="bl-institution" placeholder="Penn State" fullWidth />
      </Grid>
      {/* 3 */}
      <Grid item xs={12} display="flex" alignItems="center" sx={{ mt: 3 }}>
        <CustomFormLabel htmlFor="code" sx={{ mt: 0 }}>
          Course Code
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12}>
        <CustomTextField id="bl-code" placeholder="MATH 140" fullWidth />
      </Grid>
      {/* 4 */}
      <Grid item xs={12} display="flex" alignItems="center">
        <CustomFormLabel htmlFor="credits">
          Credits
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12}>
        <CustomTextField id="bl-credit" placeholder="3" fullWidth />
      </Grid>
      {/* 5 */}
      <Grid item xs={12} display="flex" alignItems="center">
        <CustomFormLabel htmlFor="bl-grade">
          Grade
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12}>
        <CustomTextField id="bl-grade" placeholder="A" fullWidth />
      </Grid>
      {/* 6 */}
      <Grid item xs={12} display="flex" alignItems="center">
        <CustomFormLabel htmlFor="bl-category">
          Course Category
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12}>
        <CustomTextField id="bl-category" placeholder="Biology" fullWidth />
      </Grid>
      {/* 7 */}
      <Grid item xs={12} display="flex" alignItems="center">
        <CustomFormLabel htmlFor="bl-type">
          Term Type
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12}>
        <ComboBoxAutocomplete/>
      </Grid>
      {/* 8 */}
      <Grid item xs={12} display="flex" alignItems="center">
        <CustomFormLabel htmlFor="bl-objectives">
          Learning Objectives
        </CustomFormLabel>
      </Grid>
      <Grid item xs={12}>
        <CustomTextField 
          id="bl-grade"
          placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut 
                       labore et dolore magna aliqua. Sed vulputate odio ut enim." 
          fullWidth
        />
      </Grid>
      {/* 9 */}
      <Grid item xs={12} mt={3}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit Request
          </Button>
          {displayText && <Card>{displayText}</Card>}
      </Grid>
    </Grid>
  );
};

export default StudentDashboard;