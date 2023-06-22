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
            categories: [['Learning Objectives'], ['Textbook'], ['Grading Scheme']],
            axisBorder: {
                show: false,
            },
        },
        yaxis: {
            labels: {
              show: false,
            },
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

  	const { learningObjectives, textbook, gradingScheme } = syllabusComponents

	// iterate through the learning objectives scores and determine the right color for each score
	let locolors : string[] = []
	let locategories : string[] = []

	for(let i = 0; i < learningObjectives.scores.length; i++) {
		locategories[i] = ('LO ' + (i+1 as number))
		if(learningObjectives.scores[i] < 35)
			locolors[i] = low
		else if(learningObjectives.scores[i] > 35 && learningObjectives.scores[i] < 80)
			locolors[i] = medium
		else
			locolors[i] = high
	}

	locolumnchart.xaxis.categories = locategories
	locolumnchart.colors = locolors
	loseries[0].data = learningObjectives.scores

	let maindata : number[] = []
	let maincolors : string[] = []

	maindata[0] = learningObjectives.score
	maindata[1] = textbook.score
	maindata[2] = gradingScheme.score

	for(let i = 0; i < 3; i++) {
		if(maindata[i] <= 35)
			maincolors[i] = low
		else if(maindata[i] > 35 && maindata[i] <= 80)
			maincolors[i] = medium
		else if(maindata[i] > 80)
			maincolors[i] = high
	}

	maincolumnchart.colors = maincolors
	mainseries[0].data = maindata

  	const gradingArray = Object.entries(gradingScheme.gradingScheme);

  	return (
    	<Box>
      		<>
        		<Typography variant='h1'>
          			Score: {syllabusComponents.score}
        		</Typography>
        		<Chart options={maincolumnchart} series={mainseries} type="bar" height="295px" width={"100%"}/>
        		{ 
          			mainClickedBarValue === 0 ? (
            			<>
              				<Typography variant='h3' mt={3}>
                				Learning Objectives Information
              				</Typography>
              				<Chart options={locolumnchart} series={loseries} type="bar" height="295px" width={"100%"} />
            			</>
					) : mainClickedBarValue === 1 ? (
            			<Box m={3} p={3}>
              				<Typography variant='h3' mt={3}>
                				Textbook Information
              				</Typography>
              				<Typography variant='h5' mt={3}>
                				Textbook: {textbook.title} by {textbook.author}
              				</Typography>
              				<Typography variant='h6' mt={3}>
                				Summary:
              				</Typography>
              				<Typography variant='body1'>
                				{textbook.summary}
              				</Typography>
            			</Box>
          			) : mainClickedBarValue === 2 ? (
            			<Box m={3} p={3}>
              				<Typography variant='h3' mt={3}>
                				Grading Scheme Information
              				</Typography>
              				<Typography variant='h5' mt={3}>
                				Grading Scheme:
              				</Typography>
              				<>
                				{gradingArray.map(([grade, score], index) => (
                  					<Typography variant='body1'>
                    					{grade}: {score as number}
                  					</Typography>
                				))}
              				</>
              				<Typography variant='h6' mt={3}>
                				Summary:
              				</Typography>
              				<Typography variant='body1'>
                				{gradingScheme.summary}
              				</Typography>
            			</Box>
          			) : null
        		}
        		{ 
          			mainClickedBarValue === 0 && loClickedBarValue !== null ? (
            			<Box>
              				<Typography variant='h4' mt={3}>
                				Score: {learningObjectives.scores[loClickedBarValue]}
              				</Typography>
              				<Typography variant='h4' mt={3}>
                				Learning Objective:
              				</Typography>
              				<Typography variant='body1' mt={1}>
                				{learningObjectives.objectives[loClickedBarValue]}
              				</Typography>
              				<Typography variant='h4' mt={3}>
                				Summary
              				</Typography>
              				<Typography variant='body1' mt={1}>
                				{learningObjectives.summary[loClickedBarValue]}
              				</Typography>
            			</Box>
          			) : null
        		}
      		</>
    	</Box>
  	);
};

export default BarChart;