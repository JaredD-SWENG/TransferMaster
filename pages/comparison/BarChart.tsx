import React, { useState } from 'react';
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

interface BarChartProps {
    syllabusComponents: any;
}

const BarChart: React.FC<BarChartProps> = ({syllabusComponents}: any) => {
    // chart color
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const low = '#eb8f72'
    const medium = '#6f41b6'
    const high = '#56bdc6'
    const [mainClickedBarValue, setMainClickedBarValue] = useState<number | null>(null);
    const [loClickedBarValue, setLoClickedBarValue] = useState<number | null>(null); 

  // chart
    const maincolumnchart: any = {
        chart: {
            type: 'bar',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: false,
            },
            height: 295,
            events: {
                click: function(event: MouseEvent, chartContext: any, { seriesIndex, dataPointIndex, config }: { seriesIndex: number, dataPointIndex: number, config: any }) {
                    setMainClickedBarValue(dataPointIndex);
                },
            },
        },
        colors: [primary, primary, primary, primary, primary, primary],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '45%',
                distributed: true,
                endingShape: 'rounded',
            },
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        grid: {
            yaxis: {
              lines: {
                show: false,
              },
            },
        },
        xaxis: {
            categories: [['Topic Covered'], ['Textbook'], ['Grading Scheme']],
            axisBorder: {
                show: false,
            },
        },
        yaxis: {
            labels: {
              show: false,
            },
			max: 1,
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
        },
    };
    const mainseries = [
        {
            name: 'Criteria',
            data: [50, 15, 35],
        },
    ];

  	const locolumnchart: any = {
      	chart: {
			type: 'bar',
			fontFamily: "'Plus Jakarta Sans', sans-serif;",
			foreColor: '#adb0bb',
			toolbar: {
				show: false,
			},
        	height: 295,
        	events: {
            	click: function(event: MouseEvent, chartContext: any, { seriesIndex, dataPointIndex, config }: { seriesIndex: number, dataPointIndex: number, config: any }) {
                	setLoClickedBarValue(dataPointIndex);
            	},
       		},
    	},
		colors: [primary, primary, primary, primary, primary, primary],
    	plotOptions: {
        	bar: {
				borderRadius: 4,
				columnWidth: '45%',
				distributed: true,
				endingShape: 'rounded',
        	},
    	},
		dataLabels: {
			enabled: false,
		},
		legend: {
			show: false,
		},
		grid: {
			yaxis: {
				lines: {
					show: false,
				},
			},
		},
		xaxis: {
			categories: [['LO 1'], ['LO 2'], ['LO 3'], ['LO 4'], ['LO 5']],
			axisBorder: {
				show: false,
			},
		},
		yaxis: {
			labels: {
				show: false,
			},
			max: 1,
		},
		tooltip: {
			theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
		},
  	};

  	const loseries = [
    	{
			name: 'Criteria',
			data: [50, 15, 85, 20, 45],
		},
  	];

    console.log(syllabusComponents)

	//const { score, learningObjectives, textbook, gradingScheme, summary } = syllabusComponents ?? {};
    const score = syllabusComponents?.score;
    const learningObjectives = syllabusComponents?.learningObjectives;
    const textbook = syllabusComponents?.textbook;
    const gradingScheme = syllabusComponents?.gradingScheme;
    const summary = syllabusComponents?.summary;

	// iterate through the learning objectives scores and determine the right color for each score
	let locolors: string[] = [];
    let locategories: string[] = [];

    if (learningObjectives && learningObjectives.scores !== undefined) {
        for (let i = 0; i < learningObjectives.scores.length; i++) {
            locategories[i] = 'LO ' + (i + 1);
            if (learningObjectives.scores[i] < 0.35)
                locolors[i] = low;
            else if (learningObjectives.scores[i] > 0.35 && learningObjectives.scores[i] < 0.80)
                locolors[i] = medium;
            else
                locolors[i] = high;
        }
    } else {
        locolors = [];
        locategories = [];
    }

	locolumnchart.xaxis.categories = locategories
	locolumnchart.colors = locolors
	if (learningObjectives && learningObjectives.scores) {
		loseries[0].data = learningObjectives.scores;
    } else {
		loseries[0].data = []; // or handle the case when scores is undefined
    }
	  

    let maincolors: string[] = [];
    let maindata: number[] = [];
// ...
    if (learningObjectives !== undefined && learningObjectives.score !== undefined && textbook !== undefined && textbook.score !== undefined && gradingScheme !== undefined && gradingScheme.score !== undefined) {
        maindata[0] = learningObjectives.score;
        maindata[1] = textbook.score;
	    maindata[2] = gradingScheme.score;
    } else {
        // Handle the case when the score is undefined or learningObjectives is not defined
        maindata[0] = 0; // Assign a default value or handle the error case appropriately
        maindata[1] = 0;
        maindata[2] = 0;
    }

	for(let i = 0; i < 3; i++) {
		if(maindata[i] <= 0.35)
			maincolors[i] = low
		else if(maindata[i] > 0.35 && maindata[i] <= 0.80)
			maincolors[i] = medium
		else if(maindata[i] > 0.80)
			maincolors[i] = high
	}

	maincolumnchart.colors = maincolors
	mainseries[0].data = maindata

  	return (
    	<Box>
      		<>
        		<Typography variant='h1'>
          			Score: {score}
        		</Typography>
        		<Chart options={maincolumnchart} series={mainseries} type="bar" height="295px" width={"100%"}/>
        		{ 
          			mainClickedBarValue === 0 ? (
            			<>
              				<Typography variant='h3' mt={3}>
                				Topics Covered Information
              				</Typography>
              				<Chart options={locolumnchart} series={loseries} type="bar" height="295px" width={"100%"} />
              				<Typography variant='h4' mt={3}>
                				Learning Objectives Summary
              				</Typography>
              				<Typography variant='body1' mt={1} whiteSpace={'pre-line'}>
                				{learningObjectives?.lo_summary}
              				</Typography>
              				<Typography variant='h4' mt={3}>
                				Topics Covered Summary
              				</Typography>
              				<Typography variant='body1' mt={1} whiteSpace={'pre-line'}>
                				{learningObjectives?.topics_summary}
              				</Typography>
            			</>
					) : mainClickedBarValue === 1 ? (
            			<Box m={3} p={3}>
              				<Typography variant='h3' mt={3}>
                				Textbook Information
              				</Typography>
              				<Typography variant='h5' mt={3} whiteSpace={'pre-line'}>
                				PSU Textbook: {textbook?.psuTextbook}
              				</Typography>
              				<Typography variant='h6' mt={3}>
                				Description:
              				</Typography>
              				<Typography variant='body1' whiteSpace={'pre-line'}>
                				{textbook?.psuDescription}
              				</Typography>
              				<Typography variant='h5' mt={3} whiteSpace={'pre-line'}>
                                External Textbook: {textbook?.extTextbook}
              				</Typography>
              				<Typography variant='h6' mt={3}>
                				Description:
              				</Typography>
              				<Typography variant='body1' whiteSpace={'pre-line'}>
                				{textbook?.extDescription}
              				</Typography>
              				<Typography variant='h6' mt={3}>
                				Summary:
              				</Typography>
              				<Typography variant='body1' whiteSpace={'pre-line'}>
                				{textbook?.summary}
              				</Typography>
            			</Box>
          			) : mainClickedBarValue === 2 ? (
            			<Box m={3} p={3}>
              				<Typography variant='h3' mt={3}>
                				Grading Scheme Information
              				</Typography>
              				<Typography variant='h6' mt={3}>
                				Summary:
              				</Typography>
              				<Typography variant='body1' whiteSpace={'pre-line'}>
                				{gradingScheme?.summary}
              				</Typography>
            			</Box>
          			) : null
        		}
                <Typography variant='h2' mt={3}>
                    General Summary:
                </Typography>
                <Typography variant='body1' whiteSpace={'pre-line'}>
                    {summary}
                </Typography>
      		</>
    	</Box>
  	);
};

export default BarChart;