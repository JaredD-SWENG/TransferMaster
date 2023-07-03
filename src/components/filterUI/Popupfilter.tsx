import React, { useState } from 'react';
import {
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import * as dropdownData from '../../layouts/full/vertical/header/data';
import Scrollbar from '../custom-scroll/Scrollbar';

import { IconBellRinging } from '@tabler/icons-react';
import { Stack } from '@mui/system';
import Link from 'next/link';
import FilterUI from '../../../pages/filterUI/FilterUIfaculty';
import ControlledDatepicker from './ControlledDatepicker';
import Coursecategory from './Coursecategory';
import Reviewstatus from './Reviewstatus';
import Selectfilter from './Selectreviewer';

const Popupfilter = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          color: anchorEl2 ? 'primary.main' : 'text.secondary',
        }}
        onClick={handleClick2}
      >
        <Badge variant="dot" color="primary">
          <IconBellRinging size="21" stroke="1.5" />
        </Badge>
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
          },
        }}
      >
        <Stack direction="row" py={2} px={4} justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Notifications</Typography>
          <Chip label="5 new" color="primary" size="small" />
        </Stack>
        <Scrollbar sx={{ height: '385px' }}>
         
            <Box>
              
            <Grid  lg={20} m={4}>  
               
                <Box display={'flex'} flexDirection={'column'} alignItems={'center'} gap={5}>
                    <Box display={'flex'} justifyContent={'flex-start'}  flex={1}>
                       <Coursecategory/>
                    </Box>
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
                        <Reviewstatus />
                    </Box>
                    <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flex={1}>
                        <ControlledDatepicker/>
                    </Box>
                    <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'} flex={1}>
                       <Selectfilter/>
                    </Box>
                  </Box>
</Grid> 
                   {/** 
                       <Coursecategory/>
                    
                    
                        <Reviewstatus />
                    
                    
                        <ControlledDatepicker/>
                    */}
                   
               
                  
           
             
            </Box>
        
        </Scrollbar>
        <Box p={3} pb={1}>
          <Button href="/apps/email" variant="outlined" component={Link} color="primary" fullWidth>
            See all Notifications
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Popupfilter;
