import ApiError from "../utils/api-error.js"
import type { Request, Response } from "express"

import {db} from '../../db/index.js'
import { bankTable, schemesTable , schemeTransactions ,districtTable } from '../../db/schema.js'
import { count, eq, sql,and } from "drizzle-orm"

import ApiResponse from "../utils/api-response.js"

class DashboardController{
    public getSchemes = async (req: Request, res: Response) => {
        try {
            const schemes = await db.select().from(schemesTable);
             // Get total count from transaction table
             // Scheme-wise count
               const schemeWiseCount = await db
                .select({
                    schemeId: schemesTable.id,
                    schemeName: schemesTable.schemeName,
                    shortSchName: schemesTable.shortSchName,
                    total: count(schemeTransactions.id)
                })
                .from(schemesTable)
                .leftJoin(
                    schemeTransactions,
                    eq(schemesTable.id, schemeTransactions.intSchemeId)
                )
                .groupBy(schemesTable.id);

            return ApiResponse.ok(res, "Schemes fetched successfully", { schemes, schemeWiseCount });
        } catch (error) {
            console.error("Error fetching schemes:", error);
            throw ApiError.notfound("Failed to fetch schemes");
        }
    }
        public getDistrictNames = async (req: Request, res: Response) => {
        try {
            const schemes = await db.select().from(schemesTable);
             // Get total count from transaction table
             // Scheme-wise count
               const schemeWiseCount = await db
                .select({
                      intDistrictId: districtTable.intDistrictId,
                    districtName: districtTable.vchName,
                })
                .from(schemesTable)
                .leftJoin(
                    schemeTransactions,
                    eq(schemesTable.id, schemeTransactions.intSchemeId)
                )
                .groupBy(schemesTable.id);

            return ApiResponse.ok(res, "Schemes fetched successfully", { schemes, schemeWiseCount });
        } catch (error) {
            console.error("Error fetching schemes:", error);
            throw ApiError.notfound("Failed to fetch schemes");
        }
    }
  public getSchemesstats = async (req: Request, res: Response) => {
    try {
        const stats = await db
            .select({
                total: count(),

                sanctioned: sql<number>`
                    COALESCE(SUM(CASE WHEN sanctionDate IS NOT NULL THEN 1 ELSE 0 END),0)
                `,
                disbursed: sql<number>`
                    COALESCE(SUM(CASE WHEN disbursementDate IS NOT NULL THEN 1 ELSE 0 END),0)
                `,

                rejected: sql<number>`
                    COALESCE(SUM(CASE WHEN rejectionDate IS NOT NULL THEN 1 ELSE 0 END),0)
                `,

                pending: sql<number>`
                    COALESCE(
                        SUM(
                            CASE 
                            WHEN sanctionDate IS NULL AND rejectionDate IS NULL 
                            THEN 1 ELSE 0 
                            END
                        ),0
                    )
                `
            })
            .from(schemeTransactions);

        const data = stats[0];

        return ApiResponse.ok(res, "Dashboard stats", data);

    } catch (error) {
        console.error("Error fetching schemes:", error);
        throw ApiError.notfound("Failed to fetch schemes total count");
    }
}
public getSchemeStatsById = async (req: Request, res: Response) => {
    try {
        const { schemeId } = req.params;

        const stats = await db
            .select({
                total: count(),

                sanctioned: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.sanctionDate} IS NOT NULL 
                         AND ${schemeTransactions.rejectionDate} IS NULL
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,
            disbursed: sql<number>`
                                SUM(
                                    CASE 
                                    WHEN ${schemeTransactions.disbursementDate} IS NOT NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    THEN 1 ELSE 0 
                                    END
                                ) + 0
                            `,
                rejected: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.rejectionDate} IS NOT NULL 
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,

                pending: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.sanctionDate} IS NULL 
                         AND ${schemeTransactions.rejectionDate} IS NULL 
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `
            })
            .from(schemeTransactions)
            .where(eq(schemeTransactions.intSchemeId, Number(schemeId)));

        return ApiResponse.ok(res, "Scheme stats", stats[0]);

    } catch (error) {
        console.error(error);
        throw ApiError.notfound("Failed to fetch scheme stats");
    }
}
 public getSchemePendingTransactionsById = async (req: Request, res: Response) => {
    try {
        const { schemeId } = req.params;

       const pendingTransactions = await db
  .select({
    bankName: bankTable.vchModuleName,
    bankId: bankTable.id,
                            withinSLA: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) <= 1
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                            zeroToOne: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) BETWEEN 0 AND 1
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                            oneToThree: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) BETWEEN 1 AND 3
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                            threeToSix: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) BETWEEN 3 AND 6
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                            aboveSix: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) > 6
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                            totalCount: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                          totalAmount: sql<number>`
                                            COALESCE(
                                                SUM(
                                                CASE 
                                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                                AND ${schemeTransactions.rejectionDate} IS NULL
                                                THEN ${schemeTransactions.loanApplied}
                                                ELSE 0
                                                END
                                                ),0
                                            )
                                            `
                            })
                            .from(schemeTransactions)
                            .innerJoin(
                            bankTable,
                            eq(bankTable.id, schemeTransactions.intModuleId)
                            )
                            .where(eq(schemeTransactions.intSchemeId, Number(schemeId)))
                            .groupBy(bankTable.vchModuleName);
  
        return ApiResponse.ok(res, "Scheme transactions", pendingTransactions);

    } catch (error) {
        console.error(error);
        throw ApiError.notfound("Failed to fetch scheme transactions");
    }
}
public getSchemeSanctionTransactionsById = async (req: Request, res: Response) => {
    try {
        const { schemeId } = req.params;

                    const sanctionTransactions = await db
                    .select({
                        bankName: bankTable.vchModuleName,
                        bankId: bankTable.id,
                            withinSLA: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS  NOT NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) <= 1
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,
                        zeroToOne: sql<number>`
                        SUM(
                            CASE 
                            WHEN ${schemeTransactions.sanctionDate} IS NOT NULL
                            AND ${schemeTransactions.rejectionDate} IS NULL
                            AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.sanctionDate}, NOW()) <= 1
                            THEN 1 ELSE 0 
                            END
                        ) + 0
                        `,

                    oneToThree: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.sanctionDate} IS NOT NULL
                        AND ${schemeTransactions.rejectionDate} IS NULL
                        AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.sanctionDate}, NOW()) > 1
                        AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.sanctionDate}, NOW()) <= 3
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                    `,

                    threeToSix: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.sanctionDate} IS NOT NULL
                        AND ${schemeTransactions.rejectionDate} IS NULL
                        AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.sanctionDate}, NOW()) > 3
                        AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.sanctionDate}, NOW()) <= 6
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                    `,

                    aboveSix: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.sanctionDate} IS NOT NULL
                        AND ${schemeTransactions.rejectionDate} IS NULL
                        AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.sanctionDate}, NOW()) > 6
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                    `,

                    totalCount: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.sanctionDate} IS NOT NULL
                        AND ${schemeTransactions.rejectionDate} IS NULL
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                    `,

                    totalAmount: sql<number>`
                    COALESCE(
                        SUM(
                        CASE 
                        WHEN ${schemeTransactions.sanctionDate} IS NOT NULL
                        AND ${schemeTransactions.rejectionDate} IS NULL
                        THEN ${schemeTransactions.loanSanctioned}
                        ELSE 0
                        END
                        ),0
                    )
                    `
                })
                .from(schemeTransactions)
                .leftJoin(
                    bankTable,
                    eq(bankTable.id, schemeTransactions.intModuleId)
                )
                .where(eq(schemeTransactions.intSchemeId, Number(schemeId)))
                .groupBy(bankTable.vchModuleName);
  
        return ApiResponse.ok(res, "Scheme transactions", sanctionTransactions);

    } catch (error) {
        console.error(error);
        throw ApiError.notfound("Failed to fetch scheme sanction transactions");
    }
}
public getSchemeDisbursementTransactionsById = async (req: Request, res: Response) => {
    try {
        const { schemeId } = req.params;

        const disburseTransactions = await db
            .select({
                bankName: bankTable.vchModuleName,
                bankId: bankTable.id,
                    withinSLA: sql<number>`
                                                    SUM(
                                                    CASE 
                                                    WHEN ${schemeTransactions.disbursementDate} IS NOT NULL 
                                                        AND ${schemeTransactions.rejectionDate} IS NULL
                                                        AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) <= 1
                                                    THEN 1 ELSE 0 
                                                    END
                                                    ) + 0
                                                `,
                zeroToOne: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.disbursementDate} IS NOT NULL
                         AND ${schemeTransactions.rejectionDate} IS NULL
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.disbursementDate}, NOW()) <= 1
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,

                oneToThree: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.disbursementDate} IS NOT NULL
                         AND ${schemeTransactions.rejectionDate} IS NULL
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.disbursementDate}, NOW()) > 1
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.disbursementDate}, NOW()) <= 3
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,

                threeToSix: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.disbursementDate} IS NOT NULL
                         AND ${schemeTransactions.rejectionDate} IS NULL
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.disbursementDate}, NOW()) > 3
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.disbursementDate}, NOW()) <= 6
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,

                aboveSix: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.disbursementDate} IS NOT NULL
                         AND ${schemeTransactions.rejectionDate} IS NULL
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.disbursementDate}, NOW()) > 6
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,

                totalCount: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.disbursementDate} IS NOT NULL
                         AND ${schemeTransactions.rejectionDate} IS NULL
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,

                totalAmount: sql<number>`
                    COALESCE(
                        SUM(
                            CASE 
                            WHEN ${schemeTransactions.disbursementDate} IS NOT NULL
                             AND ${schemeTransactions.rejectionDate} IS NULL
                            THEN ${schemeTransactions.loanDisbursed}
                            ELSE 0
                            END
                        ),0
                    )
                `
            })
            .from(schemeTransactions)
            .leftJoin(
                bankTable,
                eq(bankTable.id, schemeTransactions.intModuleId) // ✅ correct join
            )
            .where(eq(schemeTransactions.intSchemeId, Number(schemeId)))
            .groupBy(bankTable.vchModuleName);

        return ApiResponse.ok(res, "Scheme disbursement transactions", disburseTransactions);

    } catch (error) {
        console.error(error);
        throw ApiError.notfound("Failed to fetch scheme disbursement transactions");
    }
}
public getSchemeRejectedTransactionsById = async (req: Request, res: Response) => {
    try {
        const { schemeId } = req.params;

        const rejectedTransactions = await db
            .select({
                bankName: bankTable.vchModuleName,
                bankId: bankTable.id,
                zeroToOne: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.rejectionDate} IS NOT NULL
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.rejectionDate}, NOW()) <= 1
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,

                oneToThree: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.rejectionDate} IS NOT NULL
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.rejectionDate}, NOW()) > 1
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.rejectionDate}, NOW()) <= 3
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,

                threeToSix: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.rejectionDate} IS NOT NULL
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.rejectionDate}, NOW()) > 3
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.rejectionDate}, NOW()) <= 6
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,

                aboveSix: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.rejectionDate} IS NOT NULL
                         AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.rejectionDate}, NOW()) > 6
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,
              totalRejected: sql<number>`
                    SUM(
                        CASE 
                        WHEN ${schemeTransactions.rejectionDate} IS NOT NULL
                        THEN 1 ELSE 0 
                        END
                    ) + 0
                `,
                totalApplications: sql<number>`
                    COUNT(${schemeTransactions.id})
                `,
                
                rejectionPercent: sql<number>`
                    ROUND(
                        (
                            SUM(
                                CASE 
                                WHEN ${schemeTransactions.rejectionDate} IS NOT NULL
                                THEN 1 ELSE 0 
                                END
                            ) * 100.0
                        ) / NULLIF(COUNT(${schemeTransactions.id}), 0),
                    2)
                `
            })
            .from(schemeTransactions)
            .leftJoin(
                bankTable,
                eq(bankTable.id, schemeTransactions.intModuleId)
            )
            .where(eq(schemeTransactions.intSchemeId, Number(schemeId)))
            .groupBy(bankTable.vchModuleName);

        return ApiResponse.ok(res, "Scheme rejected transactions", rejectedTransactions);

    } catch (error) {
        console.error(error);
        throw ApiError.notfound("Failed to fetch scheme rejected transactions");
    }
}
public getBeneficiaryDetails = async (req: Request, res: Response) => {
    try {
        const { bankId, schemeId, tableId } = req.query;

        if (!bankId || !schemeId) {
            throw ApiError.badRequest("Missing parameters");
        }

        let condition;

        if (tableId === "pendingTable") {
            condition = sql`${schemeTransactions.sanctionDate} IS NULL 
                             AND ${schemeTransactions.rejectionDate} IS NULL`;
        } 
        else if (tableId === "sanctionedTable") { // ✅ fixed typo
            condition = sql`${schemeTransactions.sanctionDate} IS NOT NULL`;
        } 
        else if (tableId === "disbursedTable") {
            condition = sql`${schemeTransactions.disbursementDate} IS NOT NULL`;
        } 
        else if (tableId === "rejectedTable") {
            condition = sql`${schemeTransactions.rejectionDate} IS NOT NULL`;
        }

        // ✅ Build where clause safely
        const whereClause = condition
            ? and(
                eq(schemeTransactions.intModuleId, Number(bankId)),
                eq(schemeTransactions.intSchemeId, Number(schemeId)),
                condition
              )
            : and(
                eq(schemeTransactions.intModuleId, Number(bankId)),
                eq(schemeTransactions.intSchemeId, Number(schemeId))
              );

        const data = await db
            .select({
                bankName: bankTable.vchModuleName,
                bankId: bankTable.id,
                schemeId: schemeTransactions.intSchemeId,
                schemeName: schemesTable.schemeName,
                applicantName: schemeTransactions.applicantName,
                loanApplied: schemeTransactions.loanApplied,
                applicationDate: schemeTransactions.applicationDate,
                districtName: sql<string>`(SELECT vchName FROM ${districtTable} WHERE ${districtTable}.intDistrictId = ${schemeTransactions.intDistrictId})`,
        
            })
            .from(schemeTransactions)
            .innerJoin(bankTable, eq(bankTable.id, schemeTransactions.intModuleId))
            .innerJoin(schemesTable, eq(schemesTable.id, schemeTransactions.intSchemeId))
            .where(whereClause);
            console.log("bankId:", bankId);
            console.log("schemeId:", schemeId);
            console.log("tableId:", tableId);
            console.log("data:", data);
            
        return res.json({
            bankId,
            schemeId,
            tableId,
            data
        });

    } catch (error) {
        console.error("Error fetching beneficiary details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
// ✅ method for scheme-wise summary
public getSchemeWiseSummary = async (req: Request, res: Response) => {
  try {
    const stats = await db
      .select({
        schemeName: schemesTable.shortSchName,

        pending: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${schemeTransactions.applicationDate} IS NOT NULL
                     AND ${schemeTransactions.sanctionDate} IS NULL
                     AND ${schemeTransactions.disbursementDate} IS NULL
                THEN 1 ELSE 0
              END
            ), 0
          )
        `,

        sanctioned: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${schemeTransactions.sanctionDate} IS NOT NULL
                THEN 1 ELSE 0
              END
            ), 0
          )
        `,

        disbursed: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${schemeTransactions.disbursementDate} IS NOT NULL
                THEN 1 ELSE 0
              END
            ), 0
          )
        `
      })
      .from(schemeTransactions)
      .innerJoin(schemesTable, eq(schemesTable.id, schemeTransactions.intSchemeId))
      .groupBy(schemeTransactions.intSchemeId)
      .orderBy(sql`${schemesTable.id} ASC`);

    return ApiResponse.ok(res, "Scheme wise summary", stats);

  } catch (error) {
    console.error("Error fetching scheme summary:", error);
    throw ApiError.notfound("Failed to fetch scheme summary");
  }
}
// ✅ method for overall status breakdown
public getStatusBreakdown = async (req: Request, res: Response) => {
  try {

    const stats = await db
      .select({

        total: sql<number>`
          COUNT(*)
        `,

        pending: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${schemeTransactions.applicationDate} IS NOT NULL
                     AND ${schemeTransactions.sanctionDate} IS NULL
                     AND ${schemeTransactions.disbursementDate} IS NULL
                THEN 1 ELSE 0
              END
            ), 0
          )
        `,

        sanctioned: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${schemeTransactions.sanctionDate} IS NOT NULL
                THEN 1 ELSE 0
              END
            ), 0
          )
        `,

        rejected: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${schemeTransactions.rejectionDate} IS NOT NULL
                THEN 1 ELSE 0
              END
            ), 0
          )
        `,

        totalSanctioned: sql<number>`
          COALESCE(
            SUM(
              CASE 
                WHEN ${schemeTransactions.sanctionDate} IS NOT NULL
                THEN ${schemeTransactions.loanApplied}
                ELSE 0
              END
            ), 0
          )
        `,

        avgTicket: sql<number>`
          COALESCE(
            AVG(${schemeTransactions.loanApplied}), 0
          )
        `
      })
      .from(schemeTransactions);

   const row = stats?.[0] ?? {
            total: 0,
            pending: 0,
            sanctioned: 0,
            rejected: 0,
            totalSanctioned: 0,
            avgTicket: 0
            };


    const total = Number(row.total) || 0;

    // ✅ percentage calculation
    const response = {
      sanctioned: total ? Number(((row.sanctioned / total) * 100).toFixed(1)) : 0,
      pending: total ? Number(((row.pending / total) * 100).toFixed(1)) : 0,
      rejected: total ? Number(((row.rejected / total) * 100).toFixed(1)) : 0,
      totalSanctioned: Number(row.totalSanctioned) || 0,
      avgTicket: Number(row.avgTicket) || 0
    };

    return ApiResponse.ok(res, "Status breakdown", response);

  } catch (error) {
    console.error("Error fetching status breakdown:", error);
    throw ApiError.notfound("Failed to fetch status breakdown");
  }
}
public getDistricts = async (req: Request, res: Response) => {
        try {
           // const districts = await db.select().from(districtTable);
             // Get total count from transaction table
             // Scheme-wise count
               const districts = await db
                .select({
                    districtID: districtTable.intDistrictId,
                    districtName: districtTable.vchName,
                })
                .from(districtTable)
                .orderBy(districtTable.intDistrictId);

            return ApiResponse.ok(res, "Districts fetched successfully", districts);
        } catch (error) {
            console.error("Error fetching districts:", error);
            throw ApiError.notfound("Failed to fetch districts");
        }
    }
    
    public getDistrictSchemePendingTransactionsById = async (req: Request, res: Response) => {
    try {
       const { schemeId, districtId } = req.params;
       const pendingTransactions = await db
                        .select({
                            bankName: bankTable.vchModuleName,
                            bankId: bankTable.id,
                                                    withinSLA: sql<number>`
                                                        SUM(
                                                        CASE 
                                                        WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                                            AND ${schemeTransactions.rejectionDate} IS NULL
                                                            AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) <= 1
                                                        THEN 1 ELSE 0 
                                                        END
                                                        ) + 0
                                                    `,

                            zeroToOne: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) BETWEEN 0 AND 1
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                            oneToThree: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) BETWEEN 1 AND 3
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                            threeToSix: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) BETWEEN 3 AND 6
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                            aboveSix: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                    AND TIMESTAMPDIFF(MONTH, ${schemeTransactions.applicationDate}, NOW()) > 6
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                            totalCount: sql<number>`
                                SUM(
                                CASE 
                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                    AND ${schemeTransactions.rejectionDate} IS NULL
                                THEN 1 ELSE 0 
                                END
                                ) + 0
                            `,

                          totalAmount: sql<number>`
                                            COALESCE(
                                                SUM(
                                                CASE 
                                                WHEN ${schemeTransactions.sanctionDate} IS NULL 
                                                AND ${schemeTransactions.rejectionDate} IS NULL
                                                THEN ${schemeTransactions.loanApplied}
                                                ELSE 0
                                                END
                                                ),0
                                            )
                                            `
                            })
                            .from(schemeTransactions)
                            .innerJoin(
                            bankTable,
                            eq(bankTable.id, schemeTransactions.intModuleId)
                            )
                            .where(
                                    and(
                                        eq(schemeTransactions.intSchemeId, Number(schemeId)),
                                        eq(schemeTransactions.intDistrictId, Number(districtId))
                                    )
                                )
                            .groupBy(bankTable.vchModuleName);
  
        return ApiResponse.ok(res, "Scheme transactions", pendingTransactions);

    } catch (error) {
        console.error(error);
        throw ApiError.notfound("Failed to fetch scheme transactions");
    }
}
}


export default DashboardController;