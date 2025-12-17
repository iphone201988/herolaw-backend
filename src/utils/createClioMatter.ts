export const createClioMatter = async (
    clientId: number,
    description: string
) => {
    const CLIO_ACCESS_TOKEN = process.env.CLIO_ACCESS_TOKEN;
    if (!CLIO_ACCESS_TOKEN) {
        throw new Error("Clio access token not found");
    }

    const payload = {
        data: {
            client: {
                id: clientId,
            },
            description,
            status: "open",
            billable: true,
        },
    };

    const response = await fetch(
        "https://app.clio.com/api/v4/matters.json",
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
        throw new Error(`Failed to create Clio matter: ${errorBody}`);
    }

    const result = await response.json();
    return result?.data;
};
