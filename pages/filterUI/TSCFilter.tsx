
import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../../src/components/forms/theme-elements/CustomTextField';
import ReviewStatus from '../../src/components/filterUI/ReviewStatus';
import CourseCategory from '../../src/components/filterUI/CourseCategory';
import ControlledDatepicker from '../../src/components/filterUI/ControlledDatePicker';
import SelectReviewer from '../../src/components/filterUI/SelectReviewer';

const option1 = ['Option 1', 'Option 2', 'Option 3'];

interface Filter {
    value: string | null;
    type: string;
}

interface TCSFilterProps {
    onSelect: (value: Filter | null) => void;
}

const TCSFilter: React.FC<TCSFilterProps> = ({ onSelect }) => {
    return (
        <>
            <Grid item xs={12} lg={16} m={4}>
                <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={5}>
                    <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flex={1}>
                        <CourseCategory onSelect={onSelect} />
                    </Box>
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
                        <ReviewStatus onSelect={onSelect} />
                    </Box>
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
                        <ControlledDatepicker onSelect={onSelect} />
                    </Box>
                    <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} flex={1}>
                        <SelectReviewer onSelect={onSelect} />
                    </Box>
                </Box>
            </Grid>
        </>
    );
};

export default TCSFilter;
