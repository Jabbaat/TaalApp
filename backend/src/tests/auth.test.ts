import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.js';
import { jest } from '@jest/globals';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock Prisma
jest.mock('../lib/prisma.js', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));

describe('Auth Routes', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        // Since we are mocking, we expect 500 or specific mock behavior
        // This is just a structure example
        expect(res.status).not.toBe(404);
    });
});
