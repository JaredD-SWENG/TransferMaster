
import React, { SetStateAction, useState } from 'react';
import { Box, Typography, Button, Divider } from "@mui/material";
import Link from "next/link";
import CustomTextField from "../../../src/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../src/components/forms/theme-elements/CustomFormLabel";
import { Stack } from "@mui/system";
import { registerType } from "../../../src/types/auth/auth";
import AuthSocialButtons from "./AuthSocialButtons";
import ComboBoxAutocomplete from "../../../src/components/forms/form-elements/autoComplete/ComboBoxAutocomplete";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from "../../../config/firebase";
import router, { useRouter } from 'next/router';

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  
  const handleRoleChange = (value: string) => {
    setRole(value);
    if (value === 'Student') {
      setDepartment(''); // Clear the department when role is "Student"
    }
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Get the newly created user's UID
      const uid = userCredential.user.uid;

      // Store the user's role in the Firebase database
      const db = getFirestore();
      const usersCollection = collection(db, "Users");
      await addDoc(usersCollection, {
        Name: name,
        Email: email,
        Role: role,
        Department: department
      });

      setSuccessMessage("Successfully registered!");
      setTimeout(() => {
        setSuccessMessage("");
        router.push("/auth/auth1/login");
      }, 3000);
    } catch (error) {
      let errorMessage = "Failed to do something exceptional";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.log(errorMessage);
    }
  };
  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {/* {subtext}
      <AuthSocialButtons title="Sign up with" /> */}

      {/* <Box mt={3}>
        <Divider>
          <Typography
            component="span"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
            position="relative"
            px={2}
          >
            or sign up with
          </Typography>
        </Divider>
      </Box> */}

      <Box>
        <Stack mb={3}>
          <CustomFormLabel htmlFor="name">Name</CustomFormLabel>
          <CustomTextField
           id="name"
           variant="outlined"
           fullWidth
           value={name}
           onChange={(e: { target: { value: SetStateAction<string>; }; }) => setName(e.target.value)} />
          <CustomFormLabel htmlFor="email">Email Address</CustomFormLabel>
          <CustomTextField
            id="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEmail(e.target.value)}
          />
         
         <CustomFormLabel htmlFor="password" >Password</CustomFormLabel>
          
          <CustomTextField
           type="password" 
           id="password" 
           variant="outlined"
           fullWidth
           value={password}
          onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setPassword(e.target.value)} />
          
          <CustomFormLabel htmlFor="role">Role</CustomFormLabel>
          <ComboBoxAutocomplete
            value={role}
            setValue={handleRoleChange}
            options={['Student', 'Transfer Specialist', 'Faculty']}
            placeholder="Select role"
          />
          { role === 'Faculty' && (
            <>
              <CustomFormLabel htmlFor="department">Department</CustomFormLabel>
              <ComboBoxAutocomplete
                value={department}
                setValue={setDepartment}
                options={['Aerospace Engineering', 'African American Studies', 'Agricultural and Biological Engineering', 'Agricultural and Extension Education', 'Agricultural Economics, Sociology, and Education', 'Agricultural Sciences', 'Animal Science', 'Anthropology', 'Applied Linguistics', 'Applied Mathematics', 'Applied Research Laboratory', 'Art and Design', 'Art Education', 'Art History', 'Astronomy and Astrophysics', 'Biochemistry and Molecular Biology', 'Bioengineering', 'Biology', 'Biomedical Engineering', 'Biotechnology', 'Chemical Engineering', 'Chemistry', 'Civil and Environmental Engineering', 'Classics and Ancient Mediterranean Studies', 'Communication Arts and Sciences', 'Communication Sciences and Disorders', 'Comparative Literature', 'Computer Science and Engineering', 'Crime, Law, and Justice', 'Dance', 'Economics', 'Educational Psychology, Counseling, and Special Education', 'Electrical Engineering', 'Engineering Science and Mechanics', 'English', 'Entomology', 'Environmental Engineering', 'Environmental Sciences', 'Film-Video and Media Studies', 'Finance', 'Food Science', 'Forensic Science', 'French and Francophone Studies', 'Geography', 'Geosciences', 'Germanic and Slavic Languages and Literatures', 'Graphic Design', 'Health Policy and Administration', 'History', 'Human Development and Family Studies', 'Industrial and Manufacturing Engineering', 'Information Sciences and Technology', 'Intercollege Programs', 'International Affairs', 'Italian', 'Kinesiology', 'Landscape Architecture', 'Landscape Contracting', 'Materials Science and Engineering', 'Mathematics', 'Mechanical Engineering', 'Media Studies', 'Meteorology and Atmospheric Science', 'Microbiology', 'Molecular, Cellular, and Integrative Biosciences', 'Music', 'Nuclear Engineering', 'Nursing', 'Nutritional Sciences', 'Philosophy', 'Physics', 'Plant Science', 'Political Science', 'Psychology', 'Recreation, Park, and Tourism Management', 'Religious Studies', 'Russian', 'Science', 'Sociology', 'Spanish', 'Special Education', 'Statistics', 'Surgery', 'Supply Chain and Information Systems', 'Theatre', 'Veterinary and Biomedical Sciences', 'Wildlife and Fisheries Science', "Women's, Gender, and Sexuality Studies"]}
                placeholder="Select department"
                //disabled={role === 'Student' || role === 'Transfer Specialist'}
              />
          </>
          ) }
        </Stack>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleRegister}
        >
          Sign Up
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthRegister;


