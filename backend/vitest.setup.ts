import process from 'node:process';

process.env.BACKEND_BASE_URL = process.env.BACKEND_BASE_URL ?? 'http://localhost:8080';
