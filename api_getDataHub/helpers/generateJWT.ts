import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
}

export const generateToken = (id: string) => {
    return jwt.sign({ id }, jwtSecret, { expiresIn: '10days' });
}