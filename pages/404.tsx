import { FC } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import Link from "next/link";
import React from "react";

const Error = () => (
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
        404
      </Typography>
      <Typography align="center" variant="h1" mb={4}>
        Oops!!!
      </Typography>
      <Typography align="center" variant="h4" mb={4}>
        This page you are looking for could not be found.
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

Error.layout = "Blank";
export default Error;
