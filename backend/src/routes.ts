import { Router, Request, Response } from 'express';
import { getUsers, getAlphabetIndex, getStats } from './fileService.js';

const router = Router();
const DATA_FILE = './data/names.txt';

// paginated user retrieval with sparse index lookup
router.get('/users', async (req: Request, res: Response) => {
    try {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

        const startTime = Date.now();
        const users = await getUsers(DATA_FILE, skip, limit);
        const elapsed = Date.now() - startTime;

        res.json({
            data: users,
            meta: {
                skip,
                limit,
                count: users.length,
                queryTimeMs: elapsed,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'failed to fetch users' });
    }
});

// returns the alphabet index for quick navigation
router.get('/alphabet-index', (_req: Request, res: Response) => {
    const index = getAlphabetIndex();
    res.json(index);
});

// returns stats about the indexed dataset
router.get('/stats', (_req: Request, res: Response) => {
    const stats = getStats();
    res.json(stats);
});

export default router;
