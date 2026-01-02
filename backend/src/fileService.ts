import fs from 'fs';
import readline from 'readline';
import path from 'path';

// sparse index configuration
// we store byte offsets every N lines to balance memory vs lookup speed
const CHUNK_SIZE = 1000;

// in-memory indexes - lightweight maps that point to file positions
const lineIndex: number[] = [0];
const alphabetIndex: Record<string, number> = {};

let totalLines = 0;
let indexBuilt = false;

// builds the sparse index by scanning the file once
// time: O(n), space: O(n/CHUNK_SIZE)
export async function buildIndex(filePath: string): Promise<void> {
    console.log('building sparse index...');
    const startTime = Date.now();

    const absolutePath = path.resolve(filePath);
    const stream = fs.createReadStream(absolutePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let byteOffset = 0;
    let lineCount = 0;
    let currentLetter = '';

    for await (const line of rl) {
        // track where each letter of the alphabet starts
        const firstChar = line.charAt(0).toUpperCase();
        if (firstChar !== currentLetter && /[A-Z]/.test(firstChar)) {
            if (!alphabetIndex[firstChar]) {
                alphabetIndex[firstChar] = lineCount;
            }
            currentLetter = firstChar;
        }

        // store byte offset every CHUNK_SIZE lines
        // this gives us O(1) lookup with minimal memory
        lineCount++;
        byteOffset += Buffer.byteLength(line, 'utf-8') + 1;

        if (lineCount % CHUNK_SIZE === 0) {
            lineIndex.push(byteOffset);
        }
    }

    totalLines = lineCount;
    indexBuilt = true;

    const elapsed = Date.now() - startTime;
    const memoryUsed = (lineIndex.length * 8) / 1024;

    console.log(`index built in ${elapsed}ms`);
    console.log(`total lines: ${totalLines.toLocaleString()}`);
    console.log(`index entries: ${lineIndex.length} (~${memoryUsed.toFixed(1)}KB)`);
}

// retrieves users starting from a specific line
// uses the sparse index to seek directly to the nearest chunk
export async function getUsers(
    filePath: string,
    skip: number,
    limit: number
): Promise<string[]> {
    if (!indexBuilt) {
        throw new Error('index not built yet');
    }

    // find the closest indexed position before our target line
    const chunkIndex = Math.floor(skip / CHUNK_SIZE);
    const startByte = lineIndex[chunkIndex] || 0;
    const startLine = chunkIndex * CHUNK_SIZE;

    // create a stream starting from that byte position
    const absolutePath = path.resolve(filePath);
    const stream = fs.createReadStream(absolutePath, {
        start: startByte,
        encoding: 'utf-8',
    });

    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let currentLine = startLine;
    const results: string[] = [];

    for await (const line of rl) {
        // skip lines until we reach our target
        if (currentLine >= skip) {
            results.push(line);
        }

        // stop once we have enough
        if (results.length >= limit) {
            rl.close();
            stream.destroy();
            break;
        }

        currentLine++;
    }

    return results;
}

// returns the alphabet index for frontend navigation
export function getAlphabetIndex(): Record<string, number> {
    return { ...alphabetIndex };
}

// returns stats about the indexed file
export function getStats(): { totalLines: number; indexEntries: number; chunkSize: number } {
    return {
        totalLines,
        indexEntries: lineIndex.length,
        chunkSize: CHUNK_SIZE,
    };
}
