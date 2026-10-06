import { describe, expect, it } from 'vitest';
import {
  dateOnlySchema,
  loginSchema,
  projectCreateSchema,
  projectListQuerySchema,
  projectUpdateSchema,
  registerSchema,
  taskCreateSchema,
  taskListQuerySchema,
  taskUpdateSchema,
} from '../src';

const uuid = '3f1c2b9e-8a4d-4c6b-9e2f-1a2b3c4d5e6f';

describe('dateOnlySchema', () => {
  it('accepts real calendar dates', () => {
    expect(dateOnlySchema.parse('2024-02-29')).toBe('2024-02-29');
  });
  it.each(['2023-02-29', '2024-13-01', '24-01-01', '2024/01/01', 'not-a-date'])(
    'rejects %s',
    (value) => {
      expect(dateOnlySchema.safeParse(value).success).toBe(false);
    },
  );
});

describe('registerSchema', () => {
  it('normalizes email and trims name', () => {
    const r = registerSchema.parse({
      fullName: '  Test User ',
      email: ' Test@Example.COM ',
      password: 'secret123',
    });
    expect(r).toEqual({ fullName: 'Test User', email: 'test@example.com', password: 'secret123' });
  });
  it('rejects invalid email and weak passwords', () => {
    expect(registerSchema.safeParse({ fullName: 'Ab', email: 'bad', password: 'x' }).success).toBe(
      false,
    );
    expect(
      registerSchema.safeParse({ fullName: 'Ab', email: 'a@b.co', password: 'onlyletters' }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ fullName: 'Ab', email: 'a@b.co', password: '12345678' }).success,
    ).toBe(false);
  });
  it('rejects passwords over 72 bytes', () => {
    const r = registerSchema.safeParse({
      fullName: 'Ab',
      email: 'a@b.co',
      password: 'a1' + 'é'.repeat(36), // 2 + 72 bytes
    });
    expect(r.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('requires both fields', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co' }).success).toBe(false);
  });
});

describe('projectCreateSchema', () => {
  it('applies defaults and normalizes blanks', () => {
    const r = projectCreateSchema.parse({ name: ' Alpha ', description: '   ', startDate: '' });
    expect(r).toMatchObject({ name: 'Alpha', description: null, status: 'NOT_STARTED', startDate: null });
  });
  it('rejects whitespace-only name', () => {
    expect(projectCreateSchema.safeParse({ name: '   ' }).success).toBe(false);
  });
  it('rejects end date before start date', () => {
    const r = projectCreateSchema.safeParse({
      name: 'A',
      startDate: '2024-05-10',
      endDate: '2024-05-01',
    });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(['endDate']);
  });
  it('rejects invalid enum', () => {
    expect(projectCreateSchema.safeParse({ name: 'A', status: 'DONE' }).success).toBe(false);
  });
});

describe('projectUpdateSchema', () => {
  it('rejects empty body and unknown fields', () => {
    expect(projectUpdateSchema.safeParse({}).success).toBe(false);
    expect(projectUpdateSchema.safeParse({ userId: uuid }).success).toBe(false);
  });
  it('accepts partial update', () => {
    expect(projectUpdateSchema.parse({ status: 'COMPLETED' })).toEqual({ status: 'COMPLETED' });
  });
});

describe('task schemas', () => {
  it('requires a valid projectId', () => {
    expect(taskCreateSchema.safeParse({ projectId: 'abc', name: 'T' }).success).toBe(false);
  });
  it('applies defaults', () => {
    expect(taskCreateSchema.parse({ projectId: uuid, name: 'T' })).toMatchObject({
      priority: 'MEDIUM',
      status: 'PENDING',
    });
  });
  it('allows marking complete via partial update', () => {
    expect(taskUpdateSchema.parse({ status: 'COMPLETED' })).toEqual({ status: 'COMPLETED' });
  });
});

describe('list query schemas', () => {
  it('coerces and defaults pagination, ignores empty filters', () => {
    const r = taskListQuerySchema.parse({ page: '2', limit: '10', status: '', search: '  ' });
    expect(r).toMatchObject({ page: 2, limit: 10, order: 'desc', sortBy: 'createdAt' });
    expect(r.status).toBeUndefined();
    expect(r.search).toBeUndefined();
  });
  it('rejects limit over 100 and bad sort fields', () => {
    expect(projectListQuerySchema.safeParse({ limit: '500' }).success).toBe(false);
    expect(projectListQuerySchema.safeParse({ sortBy: 'password' }).success).toBe(false);
  });
});
