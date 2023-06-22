import { MenuItem, TableContainer, Table, TableHead, TableRow, TableCell, Typography, TableBody, Stack, Avatar, Chip, Box, Card, Button, Grid } from "@mui/material"
import CustomSelect from "../../../src/components/forms/theme-elements/CustomSelect"
import DashboardCard from "../../../src/components/shared/DashboardCard"
import { Key, ReactElement, JSXElementConstructor, ReactFragment, ReactPortal } from "react";
import { Router, useRouter } from "next/router";

//requests collection 
interface RequestType {
    id: number;
    name: string;
    syllabus: string;
    status: string;
    date: string;
  }

  //hard coded requests - to be changed so that they're pulled from "requests" collection in firebase 
const Request: RequestType[] = [
    {
        id: 1,
        name: "Sunil Joshi",
        syllabus: "MATH 141",
        status: "To-do",
        date: "06/03/2023",
    },
    {
        id: 2,
        name: "John Deo",
        syllabus: "CYBER 100",
        status: "In progress",
        date: "06/01/2023",
    },
    {
        id: 3,
        name: "Nirav Joshi",
        syllabus: "EE 211",
        status: "Approved",
        date: "05/29/2023",
    },
    {
        id: 4,
        name: "Yuvraj Sheth",
        syllabus: "ENGL 202C",
        status: "Rejected",
        date: "05/25/2023",
    }
]

const FacultyDashboard = () => {
    const router = useRouter();
    function handleClick() {
        return (
            router.push('../../comparison')
        );
    };

    const handleUploadHistoryClick = () => {
        router.push('../../myUploads')}

    return (
      
        <>
        <Grid item xs={12} mt={3} mb={3}>
            <Button variant="contained" color="primary" onClick={handleUploadHistoryClick}>My Uploads</Button>
            <Button onClick={callLambdaFunction}>Call Lambda Function</Button>
        </Grid>
        <DashboardCard
            title="Requests"
            action={<CustomSelect
                labelId="month-dd"
                id="month-dd"
                size="small"
            >
                <MenuItem value={1}>March 2023</MenuItem>
                <MenuItem value={2}>April 2023</MenuItem>
                <MenuItem value={3}>May 2023</MenuItem>
            </CustomSelect>}
        >

                <TableContainer>
                    <Table
                        aria-label="simple table"
                        sx={{
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>Requested by</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>Syllabus</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>Status</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={600}>Date</Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Request.map((basic) => (
                                <TableRow onClick={handleClick} key={basic.id}>
                                    <TableCell>
                                        <Stack direction="row" spacing={2}>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {basic.name}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                                            {basic.syllabus}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            sx={{
                                                bgcolor: basic.status === 'To-do'
                                                    ? (theme) => theme.palette.error.light
                                                    : basic.status === 'In Progress'
                                                        ? (theme) => theme.palette.warning.light
                                                        : basic.status === 'Approved'
                                                            ? (theme) => theme.palette.success.light
                                                            : basic.status === 'Rejected'
                                                                ? (theme) => theme.palette.info.light
                                                                : (theme) => theme.palette.secondary.light,
                                                color: basic.status === 'To-do'
                                                    ? (theme) => theme.palette.error.main
                                                    : basic.status === 'In Progress'
                                                        ? (theme) => theme.palette.warning.main
                                                        : basic.status === 'Approved'
                                                            ? (theme) => theme.palette.success.main
                                                            : basic.status === 'Rejected'
                                                                ? (theme) => theme.palette.info.main
                                                                : (theme) => theme.palette.secondary.main,
                                                borderRadius: '8px',
                                            }}
                                            size="small"
                                            label={basic.status} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                                            {basic.date}
                                        </Typography>
                                    </TableCell>
                                    {/* <TableCell>
                <Button variant="outlined" onClick={handleClick}>
                    Review
                </Button>
            </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DashboardCard></>
    );
};

async function callLambdaFunction() {
    const response = await fetch('https://e5vsx4lon0.execute-api.us-east-1.amazonaws.com/prod', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        num1: 421,
        num2: 2
      })
    })
    const data = await response.json();
    console.log(data);
  }

export default FacultyDashboard;