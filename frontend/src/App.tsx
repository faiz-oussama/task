import { useState, useCallback } from 'react';
import { VirtualList } from './components/VirtualList';
import { AlphabetNav } from './components/AlphabetNav';
import { useStats } from './hooks/useUsers';

export default function App() {
    const { data: stats, isLoading: isStatsLoading } = useStats();
    const [currentLetter, setCurrentLetter] = useState('A');
    const [scrollToIndex, setScrollToIndex] = useState<number | null>(null);

    // handles clicking a letter in the alphabet nav
    const handleLetterClick = useCallback((letter: string, lineIndex: number) => {
        setCurrentLetter(letter);
        setScrollToIndex(lineIndex);
    }, []);

    // called after scroll animation completes
    const handleScrollComplete = useCallback(() => {
        setScrollToIndex(null);
    }, []);

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <h1 className="logo">NameViewer</h1>

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

                        <div className="stat-item">
                            <div className="stat-value perf-badge">
                                <span className="perf-dot" />
                                Virtualized
                            </div>
                            <div className="stat-label">Rendering</div>
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
