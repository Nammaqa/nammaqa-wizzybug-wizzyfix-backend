import express from 'express';
import { getProjects, createProject, getProjectById } from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProjectById);

export default router;
