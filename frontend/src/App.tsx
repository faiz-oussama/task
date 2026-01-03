import { useState, useCallback } from 'react';
import { VirtualList } from './components/VirtualList';
import { AlphabetNav } from './components/AlphabetNav';
import { useStats } from './hooks/useUsers';

export default function App() {
    const { data: stats, isLoading: isStatsLoading } = useStats();
    const [currentLetter, setCurrentLetter] = useState('A');
    const [scrollToIndex, setScrollToIndex] = useState<number | null>(null);

    const handleLetterClick = useCallback((letter: string, lineIndex: number) => {
        setCurrentLetter(letter);
        setScrollToIndex(lineIndex);
    }, []);

    const handleScrollComplete = useCallback(() => {
        setScrollToIndex(null);
    }, []);

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="stats-bar">
                        <div className="stat-item">
                            <div className="stat-value">
                                {isStatsLoading ? '...' : stats?.totalLines.toLocaleString()}
                            </div>
                            <div className="stat-label">Total Names</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-value">
                                {isStatsLoading ? '...' : stats?.indexEntries.toLocaleString()}
                            </div>
                            <div className="stat-label">Index Entries</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-value">
                                {isStatsLoading ? '...' : `${stats?.chunkSize}`}
                            </div>
                            <div className="stat-label">Chunk Size</div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <AlphabetNav
                    currentLetter={currentLetter}
                    onLetterClick={handleLetterClick}
                />

                <VirtualList
                    scrollToIndex={scrollToIndex}
                    onScrollToComplete={handleScrollComplete}
                />
            </main>
        </div>
    );
}
