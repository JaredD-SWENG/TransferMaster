import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../forms/theme-elements/CustomTextField';
import top100Films from '../forms/form-elements/autoComplete/data';
import { validateYupSchema } from 'formik';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Filter {
    value: string | null;
    type: string;
}

interface SelectReviewerProps {
    onSelect: (value: Filter | null) => void
}

const SelectReviewer: React.FC<SelectReviewerProps> = ({ onSelect }) => {
    const [faculty, setFaculty] = useState<string[]>([]) //['Cybersecurity', 'Biology', 'Chemistry', 'SRA'];

    useEffect(() => {
        const fetchFaculty = async () => {
            // Get a reference to the 'Users' collection
            const usersCollection = collection(db, 'Users');
    
            // Create a query against the collection.
            const q = query(usersCollection, where('Role', '==', 'Faculty'));
    
            // Fetch all documents from the collection
            const usersSnapshot = await getDocs(q);
    
            // Extract 'Name' from each document and add it to the list
            const facultyMembers: string[] = [];
            usersSnapshot.forEach((doc) => {
                const facultyMember = doc.data().Name;
                if (facultyMember && !facultyMembers.includes(facultyMember)) {
                    facultyMembers.push(facultyMember);
                }
            });
    
            // Update state
            setFaculty(facultyMembers);
        };
    
        // Call the async function
        fetchFaculty();
    }, []); // Empty array means this effect runs once on component mount
    

    const handleChange = (event: React.SyntheticEvent<Element, Event>, value: string | null) => {
        let filter: Filter = {value: value, type: 'faculty'}
        onSelect(filter);
    };

    return (
        <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={faculty}
                fullWidth
                renderInput={(params) => (
                    <CustomTextField {...params} placeholder="Faculty" aria-label="Faculty" />
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
