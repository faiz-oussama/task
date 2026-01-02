import { useQuery } from '@tanstack/react-query';
import { fetchAlphabetIndex, fetchStats, fetchPage } from '../api/users';

// page size for chunking data
export const PAGE_SIZE = 50;

// hook for fetching a specific page of data
// each visible area fetches only the pages it needs
export function usePage(pageIndex: number) {
    return useQuery({
        queryKey: ['users', 'page', pageIndex],
        queryFn: () => fetchPage(pageIndex, PAGE_SIZE),
        staleTime: Infinity, // never refetch once loaded
        gcTime: 1000 * 60 * 10, // keep in cache for 10 minutes
    });
}

// hook for alphabet index
export function useAlphabetIndex() {
    return useQuery({
        queryKey: ['alphabetIndex'],
        queryFn: fetchAlphabetIndex,
    });
}

// hook for dataset stats
export function useStats() {
    return useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
    });
}
