import React, { useState } from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

interface BarChartProps {
  syllabusComponents: any;
}

const LCBarChart: React.FC<BarChartProps> = ({ syllabusComponents }: any) => {
  // chart color
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const low = "#eb8f72";
  const medium = "#6f41b6";
  const high = "#56bdc6";

  const locolumnchart: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: {
        show: false,
      },
      height: 295,
    },
    colors: [primary, primary, primary, primary, primary, primary],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "45%",
        distributed: true,
        endingShape: "rounded",
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
      categories: [["LO 1"], ["LO 2"], ["LO 3"], ["LO 4"], ["LO 5"]],
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
      theme: theme.palette.mode === "dark" ? "dark" : "light",
    },
  };
  const loseries = [
    {
      name: "Criteria",
      data: [50, 15, 85, 20, 45],
    },
  ];

  console.log(syllabusComponents);

  const score = syllabusComponents?.score * 100;
  const learningObjectives = syllabusComponents?.learningObjectives;
  const summary = syllabusComponents?.summary;

  // iterate through the learning objectives scores and determine the right color for each score
  let locolors: string[] = [];
  let locategories: string[] = [];

  if (learningObjectives && learningObjectives.scores !== undefined) {
    for (let i = 0; i < learningObjectives.scores.length; i++) {
      locategories[i] = "LO " + (i + 1);
      if (learningObjectives.scores[i] < 0.35) locolors[i] = low;
      else if (
        learningObjectives.scores[i] > 0.35 &&
        learningObjectives.scores[i] < 0.8
      )
        locolors[i] = medium;
      else locolors[i] = high;
    }
  } else {
    locolors = [];
    locategories = [];
  }

  locolumnchart.xaxis.categories = locategories;
  locolumnchart.colors = locolors;
  if (learningObjectives && learningObjectives.scores) {
    loseries[0].data = learningObjectives.scores;
  } else {
    loseries[0].data = []; // or handle the case when scores is undefined
  }

  let maincolors: string[] = [];
  let maindata: number[] = [];

  for (let i = 0; i < 3; i++) {
    if (maindata[i] <= 0.35) maincolors[i] = low;
    else if (maindata[i] > 0.35 && maindata[i] <= 0.8) maincolors[i] = medium;
    else if (maindata[i] > 0.8) maincolors[i] = high;
  }

  return (
    <Box>
      <>
        <Typography variant="h1">Score: {score}</Typography>
        <Typography variant="h3" mt={3}>
          Topics Covered Information
        </Typography>
        <Chart
          options={locolumnchart}
          series={loseries}
          type="bar"
          height="295px"
          width={"100%"}
        />
        <Typography variant="h4" mt={3}>
          Learning Objectives Summary
        </Typography>
        <Typography variant="body1" mt={1} whiteSpace={"pre-line"}>
          {learningObjectives?.lo_summary}
        </Typography>
        <Typography variant="h4" mt={3}>
          Topics Covered Summary
        </Typography>
        <Typography variant="body1" mt={1} whiteSpace={"pre-line"}>
          {learningObjectives?.topics_summary}
        </Typography>
        <Typography variant="h2" mt={3}>
          General Summary:
        </Typography>
        <Typography variant="body1" whiteSpace={"pre-line"}>
          {summary}
        </Typography>
      </>
    </Box>
  );
};

export default LCBarChart;
