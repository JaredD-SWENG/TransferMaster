import React, { SyntheticEvent } from 'react';
import { Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';

const statuses = ['Submitted', 'In-Progress', 'Approved', 'Rejected'];

interface Filter {
    value: string | null;
    type: string;
}

interface ReviewStatusProps {
    onSelect: (value: Filter | null) => void;
}

const ReviewStatus: React.FC<ReviewStatusProps> = ({ onSelect }) => {
    const [value, setValue] = React.useState<string | null>(statuses[0]);
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
                options={statuses}
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
