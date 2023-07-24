import React, { SyntheticEvent } from 'react';
import { Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';

const option1 = ['Submitted', 'Approved', 'Rejected'];

interface Filter {
    value: string | null;
    type: string;
}

interface ReviewStatusProps {
    onSelect: (value: Filter | null) => void;
}

const ReviewStatus: React.FC<ReviewStatusProps> = ({ onSelect }) => {
    const [value, setValue] = React.useState<string | null>(option1[0]);
    const [inputValue, setInputValue] = React.useState('');

    const handleChange = (event: React.SyntheticEvent<Element, Event>, value: string | null) => {
        let filter: Filter = {value: value, type: 'review-status'}
        onSelect(filter);
    };

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
                onChange={handleChange}
            />
        </>
    );
};

export default ReviewStatus;
