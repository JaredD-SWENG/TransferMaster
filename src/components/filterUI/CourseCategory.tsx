import React, { ChangeEvent } from 'react';
import { Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';

const coursecategories = ['Biology', 'Chemistry', 'SRA'];

interface Filter {
    value: string | null;
    type: string;
}

interface CourseCategoryProps {
    onSelect: (value: Filter | null) => void;
}

const CourseCategory: React.FC<CourseCategoryProps> = ({ onSelect }) => {
    const [value, setValue] = React.useState<string | null>(coursecategories[0]);
    const [inputValue, setInputValue] = React.useState('');

    const handleChange = (event: React.SyntheticEvent<Element, Event>, value: string | null) => {
        let filter: Filter = {value: value, type: 'category'}
        onSelect(filter);
    };

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
