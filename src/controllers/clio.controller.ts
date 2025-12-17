import { Request, Response, NextFunction } from "express";
import fetch from "node-fetch"; // or global fetch in Node 18+
import { SUCCESS, TryCatch } from "../utils/helper";
import ErrorHandler from "../utils/ErrorHandler";
import User from "../model/user.model";
import { userRole } from "../utils/enums";


// Controller to fetch Clio contacts/users
export const fetchClioContacts = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const CLIO_ACCESS_TOKEN = process.env.CLIO_ACCESS_TOKEN; // store your token in env

        if (!CLIO_ACCESS_TOKEN) {
            return next(new ErrorHandler("Clio access token not found", 500));
        }

        try {
            const response = await fetch(
                "https://app.clio.com/api/v4/contacts.json",
                {
                    headers: {
                        Authorization: `Bearer ${CLIO_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );



            if (!response.ok) {
                const errorBody = await response.text();
                return next(
                    new ErrorHandler(`Failed to fetch Clio contacts: ${errorBody}`, response.status)
                );
            }

            const data = await response.json();
            console.log("response...", data?.meta)
            return SUCCESS(res, 200, "Clio contacts fetched successfully", {
                data: data.data, // only return the contacts array
                meta: data.meta, // optional pagination/meta
            });
        } catch (err: any) {
            return next(new ErrorHandler(err.message || "Unknown error", 500));
        }
    }
);


export const fetchUsers = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Pagination
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            // Sorting
            const sortField = (req.query.sortBy as string) || "createdAt";
            const sortOrder = (req.query.order as string) === "desc" ? -1 : 1;
            const sort: any = { [sortField]: sortOrder };

            // Filtering
            const filters: any = {};
            filters.role = userRole.USER
            if (req.query.role) filters.role = req.query.role;
            if (req.query.isVerified) filters.isVerified = req.query.isVerified === "true";
            if (req.query.isDeleted) filters.isDeleted = req.query.isDeleted === "true";

            // Search by name, email, or phone
            if (req.query.search) {
                const search = req.query.search.toString();
                filters.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                ];
            }

            // Fetch total count for pagination
            const total = await User.countDocuments(filters);

            // Fetch users with filters, pagination, and sorting
            const users = await User.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select("-password -otp -otpExpiry -jti"); // Exclude sensitive fields

            return SUCCESS(res, 200, "Users fetched successfully", {
                users,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (err: any) {
            return next(new ErrorHandler(err.message || "Unknown error", 500));
        }
    }
);



export const createClioContactForUser = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const userId = id;

        if (!userId) {
            return next(new ErrorHandler("User ID is required", 400));
        }

        const CLIO_ACCESS_TOKEN = process.env.CLIO_ACCESS_TOKEN;
        if (!CLIO_ACCESS_TOKEN) {
            return next(new ErrorHandler("Clio access token not found", 500));
        }

        const user = await User.findById(userId);
        console.log(user)
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        // Prevent duplicate Clio contacts
        if (user.clioContactId) {
            return next(
                new ErrorHandler("User already has a Clio contact", 400)
            );
        }

        try {
            // ✅ Clio requires data wrapper
            const payload = {
                data: {
                    type: "Person",
                    first_name: user.name,
                    last_name: user.lastName,
                    email: user.email,
                    // Optional (recommended)
                    phone_numbers: user.phone
                        ? [
                            {
                                name: "Mobile",
                                number: `${user.countryCode}${user.phone}`,
                                default_number: true,
                            },
                        ]
                        : [],
                    "email_addresses": [
                        {

                            "address": user.email,
                            "default_email": true
                        }
                    ]
                },
            };

            const response = await fetch(
                "https://app.clio.com/api/v4/contacts.json",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${CLIO_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorBody = await response.text();
                return next(
                    new ErrorHandler(
                        `Failed to create Clio contact: ${errorBody}`,
                        response.status
                    )
                );
            }

            const result = await response.json();
            const clioContactId = result?.data?.id;

            if (!clioContactId) {
                return next(
                    new ErrorHandler("Clio did not return contact ID", 500)
                );
            }

            user.clioContactId = clioContactId;
            await user.save();

            return SUCCESS(res, 200, "Clio contact created successfully", {
                clioContactId,
                userId: user._id,
            });
        } catch (err: any) {
            return next(
                new ErrorHandler(err.message || "Unknown error", 500)
            );
        }
    }
);


export const assignClioContactToUser = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId, clioContactId } = req.body;

        // 1️⃣ Validate input
        if (!userId || !clioContactId) {
            return next(
                new ErrorHandler("userId and clioContactId are required", 400)
            );
        }

        const accessToken = process.env.CLIO_ACCESS_TOKEN;
        if (!accessToken) {
            return next(new ErrorHandler("Clio access token not found", 500));
        }

        // 2️⃣ Check user exists locally
        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        // 3️⃣ Validate Clio contact exists
        const clioResponse = await fetch(
            `https://app.clio.com/api/v4/contacts/${clioContactId}.json`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                },
            }
        );

        if (clioResponse.status === 404) {
            return next(
                new ErrorHandler("Clio contact does not exist", 404)
            );
        }

        if (!clioResponse.ok) {
            const errorBody = await clioResponse.text();
            return next(
                new ErrorHandler(
                    `Failed to verify Clio contact: ${errorBody}`,
                    clioResponse.status
                )
            );
        }

        // 4️⃣ Check if already assigned to another user
        const alreadyLinkedUser = await User.findOne({
            clioContactId,
            _id: { $ne: userId },
        });

        if (alreadyLinkedUser) {
            return next(
                new ErrorHandler(
                    "This Clio contact is already linked to another user",
                    409
                )
            );
        }

        // 5️⃣ Assign contact ID
        user.clioContactId = clioContactId;
        await user.save();

        // 6️⃣ Success
        return SUCCESS(res, 200, "Clio contact assigned successfully", {
            userId: user._id,
            clioContactId,
        });
    }
);




export const fetchDashboardData = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            /* =============================
               USER STATS
            ============================== */

            const [
                totalUsers,
                verifiedUsers,
                unverifiedUsers,
                clioLinkedUsers,
                deletedUsers,
            ] = await Promise.all([
                User.countDocuments({ role: userRole.USER }),
                User.countDocuments({ role: userRole.USER, isVerified: true }),
                User.countDocuments({ role: userRole.USER, isVerified: false }),
                User.countDocuments({
                    role: userRole.USER,
                    clioContactId: { $exists: true, $ne: null },
                }),
                User.countDocuments({ role: userRole.USER, isDeleted: true }),
            ]);

            /* =============================
               USERS BY MONTH (LAST 6 MONTHS)
            ============================== */

            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

            const usersByMonth = await User.aggregate([
                {
                    $match: {
                        role: userRole.USER,
                        createdAt: { $gte: sixMonthsAgo },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } },
            ]);

            /* =============================
               RECENT USERS
            ============================== */

            const recentUsers = await User.find({ role: userRole.USER })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("name lastName email isVerified clioContactId createdAt");

            /* =============================
               RESPONSE
            ============================== */

            return SUCCESS(res, 200, "Dashboard data fetched successfully", {
                stats: {
                    totalUsers,
                    verifiedUsers,
                    unverifiedUsers,
                    clioLinkedUsers,
                    deletedUsers,
                },
                charts: {
                    usersByMonth,
                },
                recentUsers,
            });
        } catch (err: any) {
            return next(
                new ErrorHandler(err.message || "Failed to fetch dashboard data", 500)
            );
        }
    }
);

export default {
    fetchDashboardData,
    assignClioContactToUser,
    fetchClioContacts,
    fetchUsers,
    createClioContactForUser
}