import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';
import top100Films from '../forms/form-elements/autoComplete/data';

const Selectreviewer = () => (
  <Autocomplete
    multiple
    fullWidth
    id="tags-outlined"
    options={top100Films}
    getOptionLabel={(option) => option.title}
    defaultValue={[top100Films[13]]}
    filterSelectedOptions
    renderInput={(params) => (
      <CustomTextField {...params} placeholder="Select faculty" aria-label="Select faculty" />
    )}
  />
);

export default Selectreviewer;
