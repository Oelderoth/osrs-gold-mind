import { useEffect, useState } from 'react';

import { OsBuddyItemHistoryEntry } from 'types/OsBuddy';
import useCache from 'hooks/useCache';

interface useItemPriceHistoryResult {
    history: OsBuddyItemHistoryEntry[];
}

async function fetchItemHistory(itemId:string, duration: number) : Promise<OsBuddyItemHistoryEntry[]> {
    const url = `https://rsbuddy.com/exchange/graphs/${duration}/${itemId}.json`;
    const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
    if (response.ok) {
        const history: OsBuddyItemHistoryEntry[] = await response.json();
        return history;
    } else {
        throw new Error(`Received non-200 status code from OsBuddy ${response.status}`)
    }
}

function timespanIsValid(timeSpan:number): boolean {
    return (timeSpan === 30 ||
        timeSpan === 90 ||
        timeSpan === 180 ||
        timeSpan === 1440 ||
        timeSpan === 4320);
}

export default function useItemPriceHistory(itemId: string|number, timeSpan: number) : useItemPriceHistoryResult {
    const [history, setHistory] = useState();

    useEffect(() => {
        (async () => {
            const [promise] = useCache(`item-history-${itemId}-${timeSpan}`, ()=>fetchItemHistory(itemId.toString(), timeSpan))
            if (itemId && timespanIsValid(timeSpan)) {
                setHistory(await promise);
            }
        })();
    }, [itemId, timeSpan]);

    return {history}    
}