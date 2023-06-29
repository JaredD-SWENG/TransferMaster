
import React, { useContext, useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import Link from "next/link";
import { loginType } from "../../../src/types/auth/auth";
import CustomCheckbox from "../../../src/components/forms/theme-elements/CustomCheckbox";
import CustomTextField from "../../../src/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "../../../src/components/forms/theme-elements/CustomFormLabel";
import { useRouter } from "next/router";
import { auth, db } from "../../../config/firebase";
import AuthSocialButtons from "./AuthSocialButtons";
import { SetStateAction, Dispatch } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";


interface GetUserRoleByEmailProps {
  db: any;
  email: string;
}

async function getUserRoleByEmail({ db, email }: GetUserRoleByEmailProps): Promise<string | null> {
  const q = query(collection(db, "Users"), where("Email", "==", email));
  console.log(q);
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    return userData.Role;
  } else {
    console.log("No such user!");
    return null;
  }
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();


  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const role = await getUserRoleByEmail({ db, email });
      console.log("role: " + role);
      if (role === "Student") {
        router.push("/dashboards/student");
      } else if (role === "Transfer Specialist") {
        router.push("/dashboards/transfer-specialist");
      } else if(role === "Reviewer") {
        router.push("/dashboards/faculty");
      }
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
      {title && (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      )}

      {/* {subtext}

      <AuthSocialButtons title="Sign in with" />
      <Box mt={3}>
        <Divider>
          <Typography
            component="span"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
            position="relative"
            px={2}
          >
            or sign in with
          </Typography>
        </Divider>
      </Box> */}

      <Stack>
        <Box>
          <CustomFormLabel htmlFor="username">Email</CustomFormLabel>
          <CustomTextField
            id="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setEmail(e.target.value)}
          />
        </Box>
        <Box>
          <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
          <CustomTextField
            id="password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setPassword(e.target.value)}
          />
        </Box>
        <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
          <FormGroup>
            <FormControlLabel
              control={<CustomCheckbox defaultChecked />}
              label="Remember this Device"
            />
          </FormGroup>
          <Typography
            component={Link}
            href="/auth/forgot-password"
            fontWeight="500"
            sx={{
              textDecoration: "none",
              color: "primary.main",
            }}
          >
            Forgot Password?
          </Typography>
        </Stack>
      </Stack>
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleLogin}
          type="submit"
        >
          Sign In
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthLogin;
