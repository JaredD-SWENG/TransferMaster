import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';
import top100Films from '../forms/form-elements/autoComplete/data';
import { validateYupSchema } from 'formik';

interface Filter {
    value: string | null;
    type: string;
}

interface SelectReviewerProps {
    onSelect: (value: Filter | null) => void
}

const SelectReviewer: React.FC<SelectReviewerProps> = ({ onSelect }) => {

    const handleChange = (event: React.SyntheticEvent<Element, Event>, value: string | null) => {
        let filter: Filter = {value: value, type: 'reviewer'}
        onSelect(filter);
    };

    const option1 = ['Faculty1', 'Faculty2', 'Faculty3'];

    return (
        <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={option1}
                fullWidth
                renderInput={(params) => (
                    <CustomTextField {...params} placeholder="Review status" aria-label="Review status" />
                )}
                onChange={handleChange}
            />
        // <Autocomplete
        //     multiple
        //     fullWidth
        //     id="tags-outlined"
        //     options={top100Films}
        //     getOptionLabel={(option) => option.title}
        //     filterSelectedOptions
        //     renderInput={(params) => (
        //         <CustomTextField {...params} placeholder="Select faculty" aria-label="Select faculty" />
        //     )}
        //     onChange={handleChange}
        // />
    );
            };

export default SelectReviewer;
