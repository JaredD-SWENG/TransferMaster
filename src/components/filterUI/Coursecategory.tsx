import React from 'react';
import { Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';

const coursecategories = ['Biology', 'Chemistry', 'SRA'];

const Coursecategory = () => {
  const [value, setValue] = React.useState<string | null>(coursecategories[0]);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <>
       <Autocomplete
    disablePortal
    id="combo-box-demo"
    options={coursecategories}
    fullWidth
    renderInput={(params) => (
      <CustomTextField {...params} placeholder="Select course category" aria-label="Select course category" />
    )}
  />
    </>
  );
};

export default Coursecategory;
