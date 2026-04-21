import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";
import ApiError from '../app/utils/api-error.js';

if (!process.env.DATABASE_URL) {
  throw ApiError.notfound('Databse URL Not Found')
}

export const db = drizzle(process.env.DATABASE_URL);
