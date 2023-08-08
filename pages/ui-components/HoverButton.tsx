import React, { useState, useRef } from 'react';
import { Box, Button, Popover, Typography } from '@mui/material';

interface HoverButtonProps {
  instructions: string;
}

const HoverButton: React.FC<HoverButtonProps> = ({ instructions }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = (event: React.MouseEvent<HTMLElement>) => {
    if (popoverRef.current && popoverRef.current.contains(event.relatedTarget as Node)) {
      return;
    }
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: 'inline-block' }}>
      <Button
        variant="outlined"
        onMouseOver={handlePopoverOpen}
        onMouseOut={handlePopoverClose}
      >
        Hover For Instructions
      </Button>
      <Popover
        ref={popoverRef}
        open={open}
        anchorEl={anchorEl} 
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onMouseOut={handlePopoverClose}
      >
        <Box 
          p={1} 
          sx={{ 
            maxWidth: '200px', 
            borderRadius: '8px', 
            boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.25)', 
            bgcolor: 'rgba(255, 255, 255, 0.95)' 
          }}
        >
          <Typography>{instructions}</Typography>
        </Box>
      </Popover>
    </Box>
  );
};

export default HoverButton;
