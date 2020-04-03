import { useEffect, useState } from 'react';

import generateUuid from 'uuid/v4';

import useSessionState from 'hooks/useSessionState';

const RUNELITE_URL = `https://api.runelite.net/runelite-`;
const BOOTSTRAP_URL = 'https://static.runelite.net/bootstrap.json';
let version = null;

async function getVersion() {
    let bootstrap = await fetchJsonOrThrow(BOOTSTRAP_URL);
    return bootstrap.client.version;
}

function getRuneliteUrl(version: string) {
    return RUNELITE_URL + version;
}

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

async function checkRuneliteSession(session: RuneliteSession, version: string): Promise<boolean> {
    if (session.status != RuneliteSessionStatus.LOGGED_IN &&
        session.status !== RuneliteSessionStatus.LOGGING_IN) {
        return false;
    }
    
    try {
        const response = await fetch(`${getRuneliteUrl(version)}/account/session-check`, {
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

    const [v, setVersion] = useSessionState('runelite-version', null);

    const login = (async () : Promise<RuneliteSession> => {
        let runeliteVersion = v;
        if (!runeliteVersion) {
            runeliteVersion = await getVersion();
            setVersion(runeliteVersion);
        }

        const sessionIsValid = await checkRuneliteSession(session, runeliteVersion);

        if (sessionIsValid) {
            return session;
        } else {
            const loginSession = session.withStatus(RuneliteSessionStatus.LOGGING_IN);
            setSession(loginSession);
            
            const loginResponse = await fetchJsonOrThrow(`${getRuneliteUrl(runeliteVersion)}/account/login?uuid=${loginSession.uuid}`);
            
            try {
                await openWindow(loginResponse.oauthUrl);
                const success = await checkRuneliteSession(loginSession, runeliteVersion);
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
    const [version, setVersion] = useSessionState('runelite-version', null);

    useEffect(() => {(async () => {
        let runeliteVersion = version;
        if (!runeliteVersion) {
            runeliteVersion = await getVersion();
            setVersion(runeliteVersion);
        }

        if (session?.status === RuneliteSessionStatus.LOGGED_IN) {
            let history: RuneliteGrandExchangeTrade[] = [];
            
            let page = await fetchJsonOrThrow(`${getRuneliteUrl(runeliteVersion)}/ge?offset=0&limit=500`, {headers:{'RUNELITE-AUTH': session.uuid}})
            let i = 0;
            while (page.length === 500) {
                history.push(...page);
                page = await fetchJsonOrThrow(`${getRuneliteUrl(runeliteVersion)}/ge?offset=${(++i * 500)}&limit=500`, {headers:{'RUNELITE-AUTH': session.uuid}})
            }
            history.push(...page);

            // Due to some bugs during development bad trade data can exist in the history
            // so lets filter those out here
            history = history.filter(trade => trade.price !== 0 && trade.quantity !== 0);

            setHistory(history);
        }
    })()}, [session, session?.status])

    return history;
}