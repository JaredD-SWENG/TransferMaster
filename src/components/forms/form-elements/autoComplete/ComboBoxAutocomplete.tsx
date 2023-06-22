import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../../theme-elements/CustomTextField';

interface ComboBoxAutocompleteProps {
  value: string;
  setValue: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}

const ComboBoxAutocomplete = ({ value, setValue, options, placeholder, disabled = false }: ComboBoxAutocompleteProps) => {
  const handleTermTypeSelect = (event: React.ChangeEvent<{}>, value: string | null) => {
    if (value) {
      setValue(value);
    }
  };

  return (
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={options}
      value={value}
      disabled={disabled}
      fullWidth
      onChange={handleTermTypeSelect}
      renderInput={(params) => (
        <CustomTextField {...params} placeholder={placeholder} aria-label={placeholder} />
      )}
    />
  );
};

export default ComboBoxAutocomplete;
