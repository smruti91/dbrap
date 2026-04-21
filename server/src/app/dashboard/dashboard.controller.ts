import ApiError from "../utils/api-error.js"
import type { Request, Response } from "express"

import {db} from '../../db/index.js'
import { schemesTable } from '../../db/schema.js'
import { eq } from "drizzle-orm"

import ApiResponse from "../utils/api-response.js"

class DashboardController{
    public getSchemes = async (req: Request, res: Response) => {
        try {
            const schemes = await db.select().from(schemesTable);
            return ApiResponse.ok(res, "Schemes fetched successfully", schemes);
        } catch (error) {
            console.error("Error fetching schemes:", error);
            throw ApiError.notfound("Failed to fetch schemes");
        }
    }
}

export default DashboardController;