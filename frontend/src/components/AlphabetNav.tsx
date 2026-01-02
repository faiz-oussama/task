import { useAlphabetIndex } from '../hooks/useUsers';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface AlphabetNavProps {
    currentLetter: string;
    onLetterClick: (letter: string, lineIndex: number) => void;
}

export function AlphabetNav({ currentLetter, onLetterClick }: AlphabetNavProps) {
    const { data: alphabetIndex, isLoading } = useAlphabetIndex();

    if (isLoading) {
        return (
            <nav className="alphabet-nav">
                {ALPHABET.map((letter) => (
                    <button key={letter} className="alphabet-btn" disabled>
                        {letter}
                    </button>
                ))}
            </nav>
        );
    }

    return (
        <nav className="alphabet-nav">
            {ALPHABET.map((letter) => {
                const lineIndex = alphabetIndex?.[letter];
                const isAvailable = lineIndex !== undefined;
                const isActive = currentLetter === letter;

                return (
                    <button
                        key={letter}
                        className={`alphabet-btn ${isActive ? 'active' : ''}`}
                        disabled={!isAvailable}
                        onClick={() => {
                            if (isAvailable) {
                                onLetterClick(letter, lineIndex);
                            }
                        }}
                        title={isAvailable ? `Jump to line ${lineIndex.toLocaleString()}` : 'No names'}
                    >
                        {letter}
                    </button>
                );
            })}
        </nav>
    );
}
