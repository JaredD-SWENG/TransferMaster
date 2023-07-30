import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';


const dates = ['last 7 days', 'last 14 days', 'last 30 days'];

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
                <CustomTextField {...params} placeholder="Date range" aria-label="Date range" />
            )}
            onChange={handleChange}
        />
    )
};

export default ControlledDatePicker;
