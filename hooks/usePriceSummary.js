import { useState, useEffect } from 'react';

function corsProxyFetcher(url) {
    return fetch(`https://cors-anywhere.herokuapp.com/${url}`, {
        headers: {
            'X-Requested-With': 'cors-proxy'
        }
    }).then(r => r.json());
}

class SummaryList {
    constructor(data) {
        this._summaryResponse = data;
    }

    getItem(id) {
        return this._summaryResponse[id];
    }

    getItems() {
        return Object.keys(this._summaryResponse).map(key=>this._summaryResponse[key]);
    }
}

export default function usePriceSummary() {
    const [summary, setSummary] = useState();

    useEffect(() => {
        async function fetchSummary() {
            const json = await corsProxyFetcher('https://rsbuddy.com/exchange/summary.json');
            setSummary(new SummaryList(json));
        }
        fetchSummary();
    }, []);

    return {summary}    
}