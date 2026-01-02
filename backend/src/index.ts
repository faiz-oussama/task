import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import { buildIndex } from './fileService.js';

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = './data/names.txt';

// middleware
app.use(cors());
app.use(express.json());

// api routes
app.use('/api', routes);

// health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// start server after building the index
async function start() {
    try {
        console.log('starting server...');
        await buildIndex(DATA_FILE);

        app.listen(PORT, () => {
            console.log(`server running on http://localhost:${PORT}`);
            console.log(`api available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('failed to start server:', error);
        process.exit(1);
    }
}

start();
