import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { wordList } from '$lib/stores';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';




// In-memory storage for game sessions (replace with a database in production)
let gameSessions: Record<string, GameSession> = {};

interface GameSession {
    playerId: string;
    score: number;
    totalMeatCount: number;
    correctWords: Record<string, number>;
    incorrectWords: Record<string, number>;
}

// Initialize the word dictionaries
function initializeWordDict(): Record<string, number> {
    return wordList.reduce((acc, word) => {
        acc[word] = 0;
        return acc;
    }, {} as Record<string, number>);
}

export const POST: RequestHandler = async ({ request }) => {
    const { playerId } = await request.json();
    //console.log('The following playerId was received:', playerId);

    // Create a new game session
    const newSession: GameSession = {
        playerId,
        score: 0,
        totalMeatCount: 0,
        correctWords: initializeWordDict(),
        incorrectWords: initializeWordDict()
    };

    //console.log('The following newSession was created:', newSession);

    gameSessions[playerId] = newSession;

    return json({ message: 'Game session created', sessionId: playerId });
};


export const PUT: RequestHandler = async ({ request }) => {
    const { playerId, score, additionalMeatCount, word, isCorrect } = await request.json();

    //console.log('The following playerId was received:', playerId);
    //console.log('The following score was received:', score);
    //console.log('The following meatCount was received:', additionalMeatCount);
    //console.log('The following word was received:', word);
    //console.log('The following isCorrect was received:', isCorrect);

    if (!gameSessions[playerId]) {
        return json({ error: 'Game session not found' }, { status: 404 });
    }

    // Update the game session
    const session = gameSessions[playerId];
    session.score += score;
    session.totalMeatCount += additionalMeatCount;
    //console.log('The following session.score was updated:', session.score);
    //console.log('The following session.totalMeatCount was updated:', session.totalMeatCount)
    if (isCorrect) {
        if (session.correctWords[word] || session.correctWords[word] === 0) {
            session.correctWords[word] = (session.correctWords[word] || 0) + 1;
        };
        //console.log('The following session.correctWords[word] was updated:', word);
        //console.log('The following session.correctWords[word] count:', session.correctWords[word]);
    } else {
        if (session.incorrectWords[word] || session.incorrectWords[word] === 0) {
            session.incorrectWords[word] = (session.incorrectWords[word] || 0) + 1;
        };
        //console.log('The following session.incorrectWords[word] was updated:', word);
        //console.log('The following session.incorrectWords[word] count:', session.incorrectWords[word]);
    }


    return json({ message: 'Game session updated', session });
};


export const GET: RequestHandler = ({ url }) => {
    const playerId = url.searchParams.get('playerId');

    if (!playerId || !gameSessions[playerId]) {
        return json({ error: 'Game session not found' }, { status: 404 });
    }

    return json(gameSessions[playerId]);
};