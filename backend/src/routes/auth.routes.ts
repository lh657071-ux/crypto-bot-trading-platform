import express, { Router, Request, Response } from 'express';
import UserRepository from '../repositories/user.repository';
import AuthService from '../services/auth.service';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, username, password, fullName } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ success: false, error: 'email, username and password are required' });
    }

    if (!AuthService.isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    if (!AuthService.isValidPassword(password)) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await AuthService.hashPassword(password);
    const user = await UserRepository.create(email, username, passwordHash, fullName);

    if (!user) {
      return res.status(500).json({ success: false, error: 'Failed to create user' });
    }

    const token = AuthService.generateToken({ userId: user.id, email: user.email });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'email and password are required' });
    }

    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await AuthService.comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is disabled' });
    }

    const token = AuthService.generateToken({ userId: user.id, email: user.email });

    const { password_hash, ...safeUser } = user;

    res.json({ success: true, data: { user: safeUser, token } });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserRepository.findById(req.userId!);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

export default router;
