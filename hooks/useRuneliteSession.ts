import useSessionState from "./useSessionState";
import generateUuid from 'uuid/v4';
import { useState, useEffect } from "react";

const RUNELITE_VERSION = '1.6.7';
const RUNELITE_URL = `http://api.runelite.net/runelite-${RUNELITE_VERSION}`;
const LOGIN_URL = `${RUNELITE_URL}/account/login`;
const SESSION_CHECK_URL = `${RUNELITE_URL}/account/session-check`;
const GE_HISTORY_URL = `${RUNELITE_URL}/ge?offset=0`;

export enum RuneliteSessionStatus {
    LOGGED_OUT,
    LOGGING_IN,
    LOGGED_IN,
    ERROR
}

export class RuneliteSession {
    constructor (public status: RuneliteSessionStatus,
        public uuid: string) {}

    withStatus(newStatus: RuneliteSessionStatus): RuneliteSession {
        return new RuneliteSession(newStatus, this.uuid);
    }
}

interface useRuneliteResult {
    session: RuneliteSession;
    login: () => Promise<RuneliteSession>;
}

async function fetchJsonOrThrow(url, options?): Promise<any> {
    const response = await fetch(url, options);
    if (response.ok) {
        return response.json();
    } else {
        throw new Error(`Received non-200 status code from OsBuddy ${response.status}`)
    }
}

async function openWindow(url): Promise<any> {
    if (typeof window === 'undefined') return;

    const win = window.open(url, '_blank');

    return new Promise((resolve, reject) => {

        const interval = setInterval(() => {
            if (!win) {
                reject();
                return;
            }

            if (win.closed) {
                clearInterval(interval);
                resolve();
            }
        }, 2500);
    })
}

function initializeRuneliteSession(): RuneliteSession {
    const sessionUuid = generateUuid();
    const session = new RuneliteSession(RuneliteSessionStatus.LOGGED_OUT, sessionUuid);
    
    return session;
}

async function checkRuneliteSession(session: RuneliteSession): Promise<boolean> {
    if (session.status != RuneliteSessionStatus.LOGGED_IN &&
        session.status !== RuneliteSessionStatus.LOGGING_IN) {
        return false;
    }
    
    try {
        const response = await fetch(SESSION_CHECK_URL, {
            headers: {
                'RUNELITE-AUTH': session.uuid
            }
        })
        return response.ok;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export default function useRuneliteSession(): useRuneliteResult {
    const [session, setSession] = useSessionState('runelite-session', initializeRuneliteSession(), {
        toString: JSON.stringify,
        fromString: (val: string) => {
            const json = JSON.parse(val);
            return new RuneliteSession(json?.status ?? RuneliteSessionStatus.ERROR, json?.uuid);
        }
    });

    const login = (async () : Promise<RuneliteSession> => {
        const sessionIsValid = await checkRuneliteSession(session);

        if (sessionIsValid) {
            return session;
        } else {
            const loginSession = session.withStatus(RuneliteSessionStatus.LOGGING_IN);
            setSession(loginSession);
            
            const loginResponse = await fetchJsonOrThrow(`${LOGIN_URL}?uuid=${loginSession.uuid}`);
            
            try {
                await openWindow(loginResponse.oauthUrl);
                const success = await checkRuneliteSession(loginSession);
                const loggedInSession = loginSession.withStatus(success ? RuneliteSessionStatus.LOGGED_IN : RuneliteSessionStatus.ERROR);
                setSession(loggedInSession);
                return loggedInSession;
            } catch (e) {
                const errorSession = loginSession.withStatus(RuneliteSessionStatus.ERROR);
                setSession(errorSession);
                return errorSession;
            }
        }
    });

    return {
        session,
        login
    }
}

export interface RuneliteGrandExchangeTrade {
    buy: boolean;
    itemId: number;
    quantity: number;
    price: number;
    time: {
        seconds: number;
        nanos: number;
    }
}

export function useRuneliteGeHistory(session: RuneliteSession): RuneliteGrandExchangeTrade[] {
    const [history, setHistory] = useState([]);

    useEffect(() => {(async () => {
        if (session?.status === RuneliteSessionStatus.LOGGED_IN) {
            setHistory(await fetchJsonOrThrow(GE_HISTORY_URL, {headers:{'RUNELITE-AUTH': session.uuid}}));
        }
    })()}, [session, session.status])

    return history;
}