import { Request, Response, NextFunction } from "express";
import fetch from "node-fetch";
import { SUCCESS, TryCatch } from "../utils/helper";
import ErrorHandler from "../utils/ErrorHandler";

/**
 * Create a Clio document with upload URL
 * The Clio API returns a PUT URL and headers that you use to upload the actual file
 */
export const createClioDocument = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, matterId } = req.body;

        // 1️⃣ Validate input
        if (!name || !matterId) {
            return next(
                new ErrorHandler("name and matterId are required", 400)
            );
        }

        const accessToken = process.env.CLIO_ACCESS_TOKEN;
        if (!accessToken) {
            return next(
                new ErrorHandler("Clio access token not found", 500)
            );
        }

        // 2️⃣ Build payload (Clio requires `data` wrapper)
        const payload = {
            data: {
                name,
                parent: {
                    id: matterId,
                    type: "Matter",
                },
            },
        };

        try {
            // 3️⃣ Create document in Clio with fields to get upload URL
            const clioResponse = await fetch(
                "https://app.clio.com/api/v4/documents.json?fields=id,latest_document_version{uuid,put_url,put_headers}",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!clioResponse.ok) {
                const errorBody = await clioResponse.text();
                return next(
                    new ErrorHandler(
                        `Failed to create Clio document: ${errorBody}`,
                        clioResponse.status
                    )
                );
            }

            const clioData = await clioResponse.json();

            // 4️⃣ Extract important data
            const documentId = clioData.data?.id;
            const latestVersion = clioData.data?.latest_document_version;

            if (!documentId || !latestVersion) {
                return next(
                    new ErrorHandler(
                        "Clio did not return document ID or version",
                        500
                    )
                );
            }

            // 5️⃣ Success - return upload details
            return SUCCESS(
                res,
                201,
                "Clio document created successfully",
                {
                    documentId,
                    uuid: latestVersion.uuid,
                    putUrl: latestVersion.put_url,
                    putHeaders: latestVersion.put_headers,
                    instructions:
                        "Use the putUrl and putHeaders to upload your file via PUT request, then mark as fully_uploaded",
                }
            );
        } catch (err: any) {
            return next(
                new ErrorHandler(
                    err.message || "Failed to create Clio document",
                    500
                )
            );
        }
    }
);

/**
 * Mark a Clio document as fully uploaded
 * After uploading file content to the PUT URL, you must call this
 */
export const markDocumentAsUploaded = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { documentId } = req.params;
        const { uuid } = req.body;

        // 1️⃣ Validate input
        if (!documentId || !uuid) {
            return next(
                new ErrorHandler("documentId and uuid are required", 400)
            );
        }

        const accessToken = process.env.CLIO_ACCESS_TOKEN;
        if (!accessToken) {
            return next(
                new ErrorHandler("Clio access token not found", 500)
            );
        }

        // 2️⃣ Build payload
        const payload = {
            data: {
                uuid,
                fully_uploaded: true,
            },
        };

        try {
            // 3️⃣ Mark as fully uploaded
            const clioResponse = await fetch(
                `https://app.clio.com/api/v4/documents/${documentId}.json?fields=id,latest_document_version{fully_uploaded}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!clioResponse.ok) {
                const errorBody = await clioResponse.text();
                return next(
                    new ErrorHandler(
                        `Failed to mark document as uploaded: ${errorBody}`,
                        clioResponse.status
                    )
                );
            }

            const clioData = await clioResponse.json();

            // 4️⃣ Success
            return SUCCESS(
                res,
                200,
                "Document marked as fully uploaded",
                clioData.data
            );
        } catch (err: any) {
            return next(
                new ErrorHandler(
                    err.message || "Failed to mark document as uploaded",
                    500
                )
            );
        }
    }
);

/**
 * Get all documents from Clio with optional filters
 */
export const getClioDocuments = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = process.env.CLIO_ACCESS_TOKEN;

        if (!accessToken) {
            return next(
                new ErrorHandler("Clio access token not found", 500)
            );
        }

        // Optional query params
        const { fields, page, per_page, matter_id, query } = req.query;

        // Build query string
        const queryParams = new URLSearchParams();

        if (fields) queryParams.append("fields", String(fields));
        if (page) queryParams.append("page", String(page));
        if (per_page) queryParams.append("per_page", String(per_page));
        if (matter_id) queryParams.append("matter_id", String(matter_id));
        if (query) queryParams.append("query", String(query));

        const url = `https://app.clio.com/api/v4/documents.json?${queryParams.toString()}`;

        try {
            // Fetch documents
            const clioResponse = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                },
            });

            if (!clioResponse.ok) {
                const errorBody = await clioResponse.text();
                return next(
                    new ErrorHandler(
                        `Failed to fetch documents: ${errorBody}`,
                        clioResponse.status
                    )
                );
            }

            const clioData = await clioResponse.json();

            // Success
            return SUCCESS(res, 200, "Documents fetched successfully", {
                meta: clioData.meta,
                data: clioData.data,
            });
        } catch (err: any) {
            return next(
                new ErrorHandler(
                    err.message || "Failed to fetch documents",
                    500
                )
            );
        }
    }
);

/**
 * Get a single Clio document by ID
 */
export const getClioDocumentById = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        if (!id) {
            return next(new ErrorHandler("Document ID is required", 400));
        }

        const accessToken = process.env.CLIO_ACCESS_TOKEN;
        if (!accessToken) {
            return next(
                new ErrorHandler("Clio access token not found", 500)
            );
        }

        const { fields } = req.query;
        const queryParams = new URLSearchParams();
        if (fields) queryParams.append("fields", String(fields));

        const url = `https://app.clio.com/api/v4/documents/${id}.json?${queryParams.toString()}`;

        try {
            const clioResponse = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                },
            });

            if (clioResponse.status === 404) {
                return next(
                    new ErrorHandler("Document not found in Clio", 404)
                );
            }

            if (!clioResponse.ok) {
                const errorBody = await clioResponse.text();
                return next(
                    new ErrorHandler(
                        `Failed to fetch document: ${errorBody}`,
                        clioResponse.status
                    )
                );
            }

            const clioData = await clioResponse.json();

            return SUCCESS(
                res,
                200,
                "Document fetched successfully",
                clioData.data
            );
        } catch (err: any) {
            return next(
                new ErrorHandler(
                    err.message || "Failed to fetch document",
                    500
                )
            );
        }
    }
);

/**
 * Delete a Clio document
 */
export const deleteClioDocument = TryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        if (!id) {
            return next(new ErrorHandler("Document ID is required", 400));
        }

        const accessToken = process.env.CLIO_ACCESS_TOKEN;
        if (!accessToken) {
            return next(
                new ErrorHandler("Clio access token not found", 500)
            );
        }

        try {
            const clioResponse = await fetch(
                `https://app.clio.com/api/v4/documents/${id}.json`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                    },
                }
            );

            if (clioResponse.status === 404) {
                return next(
                    new ErrorHandler("Document not found in Clio", 404)
                );
            }

            if (!clioResponse.ok) {
                const errorBody = await clioResponse.text();
                return next(
                    new ErrorHandler(
                        `Failed to delete document: ${errorBody}`,
                        clioResponse.status
                    )
                );
            }

            return SUCCESS(res, 200, "Document deleted successfully", {
                id,
            });
        } catch (err: any) {
            return next(
                new ErrorHandler(
                    err.message || "Failed to delete document",
                    500
                )
            );
        }
    }
);

export default {
    createClioDocument,
    markDocumentAsUploaded,
    getClioDocuments,
    getClioDocumentById,
    deleteClioDocument,
};
