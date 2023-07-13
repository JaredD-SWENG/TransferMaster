
import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from '../../src/components/forms/theme-elements/CustomTextField';
import Reviewstatus from '../../src/components/filterUI/Reviewstatus';

import Coursecategory from '../../src/components/filterUI/Coursecategory';
import ControlledDatepicker from '../../src/components/filterUI/ControlledDatepicker';


const option1 = ['Option 1', 'Option 2', 'Option 3'];

const FilterUI = () => {
  const [value, setValue] = React.useState<string | null>(option1[0]);
  const [inputValue, setInputValue] = React.useState('');

  return (
    <>
    
        <Grid item xs={12} lg={16} m={4}>
                <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={5}>
                    <Box display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flex={1}>
                       <Coursecategory/>
                    </Box>
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
                        <Reviewstatus />
                    </Box>
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
                        <ControlledDatepicker/>
                    </Box>
                    
                  </Box>
              
            </Grid>

    </>
  );
};

export default FilterUI;
