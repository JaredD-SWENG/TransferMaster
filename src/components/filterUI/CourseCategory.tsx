import React, { ChangeEvent } from 'react';
import { Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';

const coursecategories = ['Biology', 'Chemistry', 'SRA'];

interface CourseCategoryProps {
    onSelect: (value: string | null) => void;
}

const CourseCategory: React.FC<CourseCategoryProps> = ({ onSelect }) => {
    const [value, setValue] = React.useState<string | null>(coursecategories[0]);
    const [inputValue, setInputValue] = React.useState('');

    const handleChange = async (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => {
        setValue(newValue);
        console.log(newValue)
        onSelect(newValue);
    }

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
                onChange={handleChange}
            />
        </>
    );
};

export default CourseCategory;
