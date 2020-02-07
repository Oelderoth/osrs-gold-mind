import { IRawOsBuddySummaryResponse,OsBuddyPriceSummary, OsBuddyItemSummary } from '../types/osbuddy';
import { useState, useEffect } from 'react';
import useCache from './useCache';

const RAW_SUMMARY_URL = 'https://rsbuddy.com/exchange/summary.json';
const SUMMARY_URL = `https://cors-anywhere.herokuapp.com/${RAW_SUMMARY_URL}`

interface usePriceSummaryResult {
    summary: OsBuddyPriceSummary;
}

async function fetchItemSummaries() : Promise<OsBuddyPriceSummary> {
    const response = await fetch(SUMMARY_URL);
    if (response.ok) {
        const responseJson: IRawOsBuddySummaryResponse = await response.json();
        return new OsBuddyPriceSummary(responseJson);
    } else {
        throw new Error(`Received non-200 status code from OsBuddy ${response.status}`)
    }
}

export default function usePriceSummary() : usePriceSummaryResult {
    const [summary, setSummary] = useState();

    useEffect(() => {
        (async () => {
            const [promise] = useCache('item-summary-fetch', fetchItemSummaries);
            setSummary(await promise);
        })();
    }, []);

    return {summary}    
}