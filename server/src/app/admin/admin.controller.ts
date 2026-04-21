import ApiError from "../utils/api-error.js"
import type { Request, Response } from "express"

import {db} from '../../db/index.js'
import { schemesTable, dummySchemeTxnTable, schemeTransactions, bankTable, districtTable } from '../../db/schema.js'
import { eq, sql } from "drizzle-orm"

import ApiResponse from "../utils/api-response.js"

class AdminController{
    public getSchemesData = async (req: Request, res: Response) => {
        try {
          
            const data = await db
                            .select({
                            intSchemeId: schemesTable.id,
                            intModuleId: bankTable.id,
                            intDistrictId: districtTable.intDistrictId,
                            ifscCode: dummySchemeTxnTable.ifscCode,
                            applicantName: dummySchemeTxnTable.applicantName,
                            applicationDate: dummySchemeTxnTable.applicationDate,
                            loanApplied: dummySchemeTxnTable.loanApplied,
                            sanctionDate: dummySchemeTxnTable.sanctionDate,
                            loanSanctioned: dummySchemeTxnTable.loanSanctioned,
                            disbursementDate: dummySchemeTxnTable.disbursementDate,
                            loanDisbursed: dummySchemeTxnTable.loanDisbursed,
                            rejectionDate: dummySchemeTxnTable.rejectionDate,
                            reasonRejection: dummySchemeTxnTable.reasonRejection,
                            uniqueId: dummySchemeTxnTable.uniqueId,
                            })
                            .from(dummySchemeTxnTable)
                            .leftJoin(schemesTable, eq(schemesTable.schemeName, dummySchemeTxnTable.schemeName))
                            .leftJoin(bankTable, eq(bankTable.vchModuleName, dummySchemeTxnTable.moduleName))
                            .leftJoin(
                            districtTable,
                            sql`TRIM(LOWER(${districtTable.vchName})) = TRIM(LOWER(${dummySchemeTxnTable.districtName}))`
                            )

                            
                            //inert data into schemeTransactions table  
                //@ts-ignore
            await db.insert(schemeTransactions).values(data);

            return ApiResponse.ok(res, "Schemes fetched successfully", data);
        } catch (error) {
            console.error("Error fetching schemes:", error);
            throw ApiError.notfound("Failed to fetch schemes");
        }
    }
}

export default AdminController;