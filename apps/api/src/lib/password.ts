import bcrypt from 'bcryptjs';
import { env } from '../config/env';

// Cost 12 in real environments; cost 4 under test only to keep the suite fast.
const BCRYPT_COST = env.isTest ? 4 : 12;

export const hashPassword = (plain: string) => bcrypt.hash(plain, BCRYPT_COST);

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

/**
 * Pre-computed hash used to equalize response time when an email doesn't exist,
 * so login timing doesn't reveal which emails are registered.
 */
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync('timing-equalizer-not-a-real-password', BCRYPT_COST);
