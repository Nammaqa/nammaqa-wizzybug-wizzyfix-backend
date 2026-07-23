import express from 'express';
import { registerUser, loginUser, inviteUser, acceptInvite } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/invite', inviteUser);
router.post('/accept-invite', acceptInvite);

export default router;
