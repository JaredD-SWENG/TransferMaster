import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import CourseCategory from '../../src/components/filterUI/CourseCategory';
import ReviewStatus from '../../src/components/filterUI/ReviewStatus';
import ControlledDatePicker from '../../src/components/filterUI/ControlledDatePicker';


const option1 = ['Option 1', 'Option 2', 'Option 3'];

interface FacultyFilterProps {
    onSelect: (value: string | null) => void;
}

const FacultyFilter: React.FC<FacultyFilterProps> = ({ onSelect }) => {
    const [value, setValue] = useState<string | null>(option1[0]);
    const [inputValue, setInputValue] = useState('');
    const [courseCategory, setCourseCategory] = useState<string | null>(null);
    const [reviewStatus, setReviewStatus] = useState<string | null>(null);
    const [date, setDate] = useState<string | null>(null);

    const handleCourseCategorySelect = (value: string | null) => {
        setCourseCategory(value);
    }
    const handleReviewStatusSelect = (value: string | null) => {
        setReviewStatus(value);
    }
    const handleDateSelect = (value: string | null) => {
        setDate(value);
    }

    return (
        <>
            <Grid item xs={12} lg={16} m={4}>
                <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={5}>
                    <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flex={1}>
                        <CourseCategory onSelect={handleCourseCategorySelect} />
                    </Box>
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
                        <ReviewStatus onSelect={handleReviewStatusSelect} />
                    </Box>
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
                        <ControlledDatePicker onSelect={handleDateSelect} />
                    </Box>
                </Box>
            </Grid>
        </>
    );
};

export default FacultyFilter;
