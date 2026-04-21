import express from 'express';
import "dotenv/config";
import type { Express } from 'express';
import { authRouter } from './auth/auth.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import cookieParser  from "cookie-parser"
import cors from "cors"
import { router as dashboardRouter } from './dashboard/dashboard.routes.js';    
import { adminRouter } from './admin/admin.routes.js';


export function createApplication(): Express{
    const app = express();
    // Middleware to parse JSON bodies
    app.use(cors({
        origin: "http://127.0.0.1:5500", // or your frontend port
        credentials: true
        }));
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/dashboard', dashboardRouter);
    app.use('/api/v1/admin', adminRouter);
    
     app.use(errorHandler)
    //routs
    app.get('/', (req, res) => {
        return res.json({ message: 'Welcome to ChaiCode Auth Service' })
    })

    return app;
}