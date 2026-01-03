import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import { buildIndex } from './fileService.js';

const app = express();
const PORT = 3001;
const DATA_FILE = './data/names.txt';

// middleware
app.use(cors());
app.use(express.json());

// api routes
app.use('/api', routes);

// start server after building the index
async function start() {
    try {
        await buildIndex(DATA_FILE);

        app.listen(PORT, () => {
            console.log(`server running`);
        });
    } catch (error) {
        console.error('failed to start server:', error);
        process.exit(1);
    }
}

start();
