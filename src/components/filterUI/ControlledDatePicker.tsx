import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';
import top100Films from '../forms/form-elements/autoComplete/data';


const dates = ['last 7 days', 'last 14 days', 'last 21 days', 'last 30 days', 'custom date'];

interface Filter {
    value: string | null;
    type: string;
}

interface ControlledDatePickerProps {
    onSelect: (value: Filter | null) => void;
}

const ControlledDatePicker: React.FC<ControlledDatePickerProps> = ({ onSelect }) => {

    const handleChange = (event: React.SyntheticEvent<Element, Event>, value: string | null) => {
        let filter: Filter = {value: value, type: 'date'}
        onSelect(filter);
    };

    return (
        <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={dates}
            fullWidth
            renderInput={(params) => (
                <CustomTextField {...params} placeholder="last 7 days" aria-label="last 7 days" />
            )}
            onChange={handleChange}
        />
    )
};

export default ControlledDatePicker;
