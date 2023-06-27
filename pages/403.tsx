import { FC } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import Link from "next/link";
import React from "react";

const Error403 = () => (
  <Box
    display="flex"
    flexDirection="column"
    height="100vh"
    textAlign="center"
    justifyContent="center"
  >
    <Container maxWidth="md">
      {/* <img
        src={"/images/backgrounds/errorimg.svg"}
        alt="404"
        style={{ width: "100%", maxWidth: "500px" }}
      /> */}
      <Typography align="center" variant="h1" mb={4}>
        403
      </Typography>
      <Typography align="center" variant="h1" mb={4}>
        Oops!!!
      </Typography>
      <Typography align="center" variant="h4" mb={4}>
        You do not have access to this page
      </Typography>
      <Button
        color="primary"
        variant="contained"
        component={Link}
        href="/"
        disableElevation
      >
        Go Back to Home
      </Button>
    </Container>
  </Box>
);

Error403.layout = "Blank";
export default Error403;
