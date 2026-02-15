/**
 * Quote API endpoint - deprecated.
 * This functionality is being rebuilt from scratch.
 */
export default async function handler(req, res) {
    return res.status(501).json({
        error: 'Quote generation is currently disabled. Rebuilding from scratch.',
        message: 'This endpoint will be reimplemented'
    })
}
