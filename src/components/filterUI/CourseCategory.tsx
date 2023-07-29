import React, { ChangeEvent, useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';


interface Filter {
    value: string | null;
    type: string;
}

interface CourseCategoryProps {
    onSelect: (value: Filter | null) => void;
}

const CourseCategory: React.FC<CourseCategoryProps> = ({ onSelect }) => {
    const [courseCategories, setCourseCategories] = useState<string[]>([]) //['Cybersecurity', 'Biology', 'Chemistry', 'SRA'];

    useEffect(() => {
        const fetchCategories = async () => {
            // Get a reference to the 'Syllabi' collection
            const syllabiCollection = collection(db, 'Syllabi');

            // Fetch all documents from the collection
            const syllabiSnapshot = await getDocs(syllabiCollection);

            // Extract 'CourseCategory' from each document and add it to the list
            const categories: string[] = [];
            syllabiSnapshot.forEach((doc) => {
                const category = doc.data().CourseCategory;
                if (category && !categories.includes(category)) {
                categories.push(category);
                }
            });

            // Update state
            setCourseCategories(categories);
        };

        // Call the async function
        fetchCategories();
    }, []); // Empty array means this effect runs once on component mount

    const [value, setValue] = React.useState<string | null>(courseCategories[0]);
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
                options={courseCategories}
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
