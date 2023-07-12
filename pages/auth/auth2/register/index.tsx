// import { Grid, Box, Card, Typography, Stack } from '@mui/material';
// import Link from 'next/link';
// import PageContainer from '../../../../src/components/container/PageContainer';
// import Logo from '../../../../src/layouts/full/shared/logo/Logo';
// import AuthRegister from '../../authForms/AuthRegister';

// const Register2 = () => (
//   <PageContainer>
//     <Box
//       sx={{
//         position: 'relative',
//         '&:before': {
//           content: '""',
//           background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
//           backgroundSize: '400% 400%',
//           animation: 'gradient 15s ease infinite',
//           position: 'absolute',
//           height: '100%',
//           width: '100%',
//           opacity: '0.3',
//         },
//       }}
//     >
//       <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
//         <Grid
//           item
//           xs={12}
//           sm={12}
//           lg={5}
//           xl={4}
//           display="flex"
//           justifyContent="center"
//           alignItems="center"
//         >
//           <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '450px' }}>
//             <Box display="flex" alignItems="center" justifyContent="center">
//               <Logo />
//             </Box>
//             <AuthRegister
//               subtext={
//                 <Typography variant="subtitle1" textAlign="center" color="textSecondary" mb={1}>
//                   Your Social Campaigns
//                 </Typography>
//               }
//               subtitle={
//                 <Stack direction="row" spacing={1} mt={3}>
//                   <Typography color="textSecondary" variant="h6" fontWeight="400">
//                     Already have an Account?
//                   </Typography>
//                   <Typography 
//                     component={Link}
//                     href="/auth/auth2/login"
//                     fontWeight="500"
//                     sx={{
//                       textDecoration: 'none',
//                       color: 'primary.main',
//                     }}
//                   >
//                     Sign In
//                   </Typography>
//                 </Stack>
//               }
//             />
//           </Card>
//         </Grid>
//       </Grid>
//     </Box>
//   </PageContainer>
// );

// Register2.layout = "Blank";
// export default Register2;

import Link from "next/link";
import { Grid, Box, Typography, Stack } from "@mui/material";
import PageContainer from "../../../../src/components/container/PageContainer";
import Logo from "../../../../src/layouts/full/shared/logo/Logo";

import AuthRegister from "../../authForms/AuthRegister";

const Register2 = () => (
  <PageContainer>
    <Grid
      container
      spacing={0}
      justifyContent="center"
      sx={{ overflowX: "hidden" }}
    >
      <Grid
        item
        xs={12}
        sm={12}
        lg={7}
        xl={8}
        sx={{
          position: "relative",
          "&:before": {
            content: '""',
            background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
            backgroundSize: "400% 400%",
            animation: "gradient 15s ease infinite",
            position: "absolute",
            height: "100%",
            width: "100%",
            opacity: "0.3",
          },
        }}
      >
        <Box position="relative">
          <Box px={3}>
            <Logo />
          </Box>
          <Box
            alignItems="center"
            justifyContent="center"
            height={"calc(100vh - 75px)"}
            sx={{
              display: {
                xs: "none",
                lg: "flex",
              },
            }}
          >
            <img
              src={"/images/backgrounds/login-bg.svg"}
              alt="bg"
              style={{
                width: "100%",
                maxWidth: "600px",
                borderRadius: '25px',
              }}
            />
          </Box>
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        sm={12}
        lg={5}
        xl={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Box p={4}>
          <AuthRegister
            title="Welcome to TransferMaster"
            subtext={
              <Typography variant="subtitle1" color="textSecondary" mb={1}>
                Your TransferCredit Portal
              </Typography>
            }
            subtitle={
              <Stack direction="row" spacing={1} mt={3}>
                <Typography color="textSecondary" variant="h6" fontWeight="400">
                  Already have an Account?
                </Typography>
                <Typography
                  component={Link}
                  href="/auth/auth1/login"
                  fontWeight="500"
                  sx={{
                    textDecoration: "none",
                    color: "primary.main",
                  }}
                >
                  Sign In
                </Typography>
              </Stack>
            }
          />
        </Box>
      </Grid>
    </Grid>
  </PageContainer>
);

Register2.layout = "Blank";
export default Register2;
