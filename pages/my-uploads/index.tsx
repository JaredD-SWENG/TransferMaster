import React, { useEffect } from 'react';
import { useDispatch, useSelector } from '../../src/store/Store';
import { format } from 'date-fns';
import {
  Box,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Typography,
  TableBody,
  IconButton,
  Chip,
  Stack,
  Avatar,
  Tooltip,
  TextField,
  Pagination,
  useTheme,
  Grid,
  Button,
} from '@mui/material';
import { fetchTickets, DeleteTicket, SearchTicket, AddTicket } from '../../src/store/apps/tickets/TicketSlice';
import { IconTrash } from '@tabler/icons-react';
import { TicketType } from '../../src/types/apps/ticket';




const TicketListing = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

 

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  
  const getVisibleTickets = (tickets: TicketType[], filter: string, ticketSearch: string) => {
    switch (filter) {
      case 'total_tickets':
        return tickets.filter(
          (c) => !c.deleted && c.ticketTitle.toLocaleLowerCase().includes(ticketSearch),
        );

      case 'Pending':
        return tickets.filter(
          (c) =>
            !c.deleted &&
            c.Status === 'Pending' &&
            c.ticketTitle.toLocaleLowerCase().includes(ticketSearch),
        );

      case 'Closed':
        return tickets.filter(
          (c) =>
            !c.deleted &&
            c.Status === 'Closed' &&
            c.ticketTitle.toLocaleLowerCase().includes(ticketSearch),
        );

      case 'Open':
        return tickets.filter(
          (c) =>
            !c.deleted &&
            c.Status === 'Open' &&
            c.ticketTitle.toLocaleLowerCase().includes(ticketSearch),
        );

      default:
        throw new Error(`Unknown filter: ${filter}`);
    }
  };

  const tickets = useSelector((state) =>
    getVisibleTickets(
      state.ticketReducer.tickets,
      state.ticketReducer.currentFilter,
      state.ticketReducer.ticketSearch,
    ),
  );
  

  return (
    <Box mt={4}>
       
      <Box sx={{ maxWidth: '260px', ml: 'auto' }} mb={3}>
        <TextField
          size="small"
          label="Search"
          fullWidth
          onChange={(e) => dispatch(SearchTicket(e.target.value))}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6">Id</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">Syllabus Name</Typography>
              </TableCell>
            
              <TableCell>
                <Typography variant="h6">Date</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6">Action</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.Id} hover>
                <TableCell>{ticket.Id}</TableCell>
                <TableCell>
                 
                    <Typography variant="h6" fontWeight={600} noWrap>
                      {ticket.ticketTitle}
                    </Typography>
                    
                 
                </TableCell>
                
                <TableCell>
                  <Typography variant="subtitle1">
                    {format(new Date(ticket.Date), 'E, MMM d')}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  {/**Edit */}
                  <Tooltip title="Edit">
                    <IconButton onClick={() => dispatch(DeleteTicket(ticket.Id))}>
                      <IconTrash size="18" />
                    </IconButton>
                  </Tooltip>

                  {/**Delete 
                  <Tooltip title="Delete">
                    <IconButton onClick={() => dispatch(DeleteTicket(ticket.Id))}>
                      <IconTrash size="18" />
                    </IconButton>
                  </Tooltip>*/}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box my={3} display="flex" justifyContent={'center'}>
        <Pagination count={10} color="primary" />
      </Box>
    </Box>
  );
};

export default TicketListing;
