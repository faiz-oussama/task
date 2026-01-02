import axios from 'axios';

const API_BASE = '/api';

export interface UsersResponse {
    data: string[];
    meta: {
        skip: number;
        limit: number;
        count: number;
        queryTimeMs: number;
    };
}

export interface Stats {
    totalLines: number;
    indexEntries: number;
    chunkSize: number;
}

export type AlphabetIndex = Record<string, number>;

// fetches a specific page of users by page index
// enables random access - jump to any page without loading previous ones
export async function fetchPage(pageIndex: number, pageSize: number = 50): Promise<string[]> {
    const skip = pageIndex * pageSize;
    const response = await axios.get<UsersResponse>(`${API_BASE}/users`, {
        params: { skip, limit: pageSize }
    });
    return response.data.data;
}

// fetches the alphabet index for quick navigation
export async function fetchAlphabetIndex(): Promise<AlphabetIndex> {
    const response = await axios.get<AlphabetIndex>(`${API_BASE}/alphabet-index`);
    return response.data;
}

// fetches stats about the indexed dataset
export async function fetchStats(): Promise<Stats> {
    const response = await axios.get<Stats>(`${API_BASE}/stats`);
    return response.data;
}
