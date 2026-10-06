import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Auth Endpoints', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('fails to register with duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      fullName: 'First',
      email: 'dup@example.com',
      password: 'Password123!',
    });

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Second',
      email: 'dup@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});
