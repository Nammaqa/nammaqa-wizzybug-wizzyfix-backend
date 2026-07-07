import express from 'express';
import { getTickets, createTicket, getTicketById, updateTicketStatus, getTicketScreenshot } from '../controllers/ticketController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getTickets)
  .post(createTicket);

router.route('/:id')
  .get(getTicketById);

router.route('/:id/screenshot')
  .get(getTicketScreenshot);

router.route('/:id/status')
  .put(updateTicketStatus);

export default router;
