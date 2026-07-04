import { Response } from 'express';
import Ticket from '../models/Ticket';
import { AuthRequest } from '../middleware/authMiddleware';

export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tickets = await Ticket.find()
      .populate('project', 'name')
      .populate('creator', 'name email')
      .populate('assignee', 'name email');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority, project, assignee } = req.body;

    // Mock project and user for frontend integration testing
    let projectId = project;
    let creatorId = req.user?._id;

    if (!projectId || !creatorId) {
      const defaultUser = await import('../models/User').then(m => m.default.findOne());
      const defaultProject = await import('../models/Project').then(m => m.default.findOne());
      if (defaultUser) creatorId = creatorId || defaultUser._id;
      if (defaultProject) projectId = projectId || defaultProject._id;
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority ? priority.toLowerCase() : 'medium',
      project: projectId,
      assignee,
      creator: creatorId
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getTicketById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('project', 'name')
      .populate('creator', 'name email')
      .populate('assignee', 'name email');
      
    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    ticket.status = status;
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
