import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret')
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'developer'
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const inviteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const { v4: uuidv4 } = require('uuid');
    const inviteToken = uuidv4();

    const user = await User.create({
      name,
      email,
      role: role || 'developer',
      status: 'pending',
      inviteToken
    });

    const nodemailer = require('nodemailer');
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const inviteUrl = `http://localhost:5173/accept-invite?token=${inviteToken}`;

    const info = await transporter.sendMail({
      from: '"WizzyTrack Admin" <admin@wizzytrack.com>',
      to: email,
      subject: 'You have been invited to WizzyTrack',
      text: `Hello ${name},\n\nYou have been invited to join WizzyTrack as a ${role}.\nPlease click the following link to accept your invitation and set your password:\n\n${inviteUrl}\n\nThanks,\nWizzyTrack Team`,
      html: `<p>Hello ${name},</p><p>You have been invited to join WizzyTrack as a ${role}.</p><p><a href="${inviteUrl}">Click here to accept your invitation and set your password</a></p>`
    });

    console.log('Invite email sent: %s', nodemailer.getTestMessageUrl(info));

    res.status(201).json({ message: 'Invite sent', user: { name: user.name, email: user.email, role: user.role, status: user.status } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({ inviteToken: token, status: 'pending' });
    if (!user) {
      res.status(400).json({ message: 'Invalid or expired invite token' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.status = 'active';
    user.inviteToken = undefined;
    await user.save();

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
