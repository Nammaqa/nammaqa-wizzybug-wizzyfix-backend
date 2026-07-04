import { Response } from 'express';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find().populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, members } = req.body;
    
    // Default members to creator if not provided
    const projectMembers = members || (req.user ? [req.user._id] : []);

    const project = await Project.create({
      name,
      description,
      members: projectMembers
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email');
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
