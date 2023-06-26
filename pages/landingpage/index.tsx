import { Box, Button, Container, Grid, Stack, Theme, Typography, styled, useMediaQuery } from "@mui/material";
import PageContainer from "../../src/components/container/PageContainer"
import LpHeader from "../../src/components/landingpage/header/Header";
import { IconRocket } from "@tabler/icons-react";
import { motion } from "framer-motion";

const StyledButton = styled(Button)(() => ({
    padding: '13px 48px',
    fontSize: '16px',
}));

const LandingPage = () => {
    const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

    return (
        <PageContainer>
            <LpHeader/>
            <Box mb={10} mt={20} sx={{ overflow: "hidden" }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} lg={6} sm={8}>
                            <Box mt={lgDown ? 8 : 0} sx={{spacing:'0', justifyContent:"center" }}>
                                <motion.div
                                    initial={{ opacity: 0, translateY: 550 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{
                                    type: 'spring',
                                    stiffness: 150,
                                    damping: 30,
                                    }}
                                >
                                    <Typography variant="h6" display={'flex'} gap={1} mb={2}>
                                        <Typography color={'secondary'}>
                                            <IconRocket size={'21'} />
                                        </Typography>{' '}
                                        The Transfer Credit Process Reimagined with
                                    </Typography>
                                    <Typography
                                        variant="h1"
                                        fontWeight={900}
                                        sx={{
                                            fontSize: {
                                                md: '54px',
                                            },
                                            lineHeight: {
                                                md: '60px',
                                            },
                                        }}
                                    >
                                        <Typography component={'span'} variant="inherit" color={'primary'}>
                                            TransferMaster
                                        </Typography>{' '}
                                    </Typography>
                                </motion.div>
                                <Box pt={4} pb={3}>
                                    <motion.div
                                    initial={{ opacity: 0, translateY: 550 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 150,
                                        damping: 30,
                                        delay: 0.2,
                                    }}
                                    >
                                        <Typography variant="h5" fontWeight={300}>
                                            TransferMaster speeds up the transfer credit process with AI 
                                        </Typography>
                                    </motion.div>
                                </Box>
                                <motion.div
                                    initial={{ opacity: 0, translateY: 550 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{
                                    type: 'spring',
                                    stiffness: 150,
                                    damping: 30,
                                    delay: 0.4,
                                    }}
                                >
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={3}>
                                    <StyledButton variant="contained" color="primary" href="/auth/auth1/login">
                                        Login
                                    </StyledButton>
                                    <StyledButton variant="outlined" href="/auth/auth2/register">
                                        Register
                                    </StyledButton>
                                    </Stack>
                                </motion.div>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </PageContainer>
    )
}

LandingPage.layout = "Blank";
export default LandingPage;