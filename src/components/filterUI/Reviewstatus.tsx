import React from 'react';
import { Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';

const option1 = ['To-do', 'In Progress', 'Reviewed'];

const Reviewstatus = () => {
  const [value, setValue] = React.useState<string | null>(option1[0]);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <>
       <Autocomplete
    disablePortal
    id="combo-box-demo"
    options={option1}
    fullWidth
    renderInput={(params) => (
      <CustomTextField {...params} placeholder="Review status" aria-label="Review status" />
    )}
  />
    </>
  );
};

export default Reviewstatus;
