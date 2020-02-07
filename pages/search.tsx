import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import { useRouter, NextRouter } from 'next/router';
import usePriceSummary from '../hooks/usePriceSummary';
import { OsBuddyItemSummary, OsBuddyPriceSummary } from '../types/osbuddy';
import { highVolumeFilter as filter } from '../filters';
import queryString from 'query-string';
import escapeStringRegexp from 'escape-string-regexp';

import '../styles.scss';
import ItemSummaryGrid from '../components/itemSummaryGrid';

function getQuery(router: NextRouter): string | undefined {
    // Since router queries are only populated on SSR and single-page navigations, 
    // we use query-strings to grab item name query params if they're otherwise unpopulated

    const itemId = router?.query?.q ??
        queryString.parse(router.asPath).q;
    return itemId?.toString();
}

const itemFilter = (value: string): (item: OsBuddyItemSummary) => boolean => {
    if (!value || value.length == 0) return () => false;

    const escaped = escapeStringRegexp(value).replace(/\s+/g, '.+?');
    const regex = new RegExp(escaped, 'i')
    
    return (item) => regex.test(item.name);
}

const HighVolume: NextPage = function () {
    const { summary } = usePriceSummary();
    const router = useRouter();
    const query = getQuery(router);
    const items = summary?.getItems()
        ?.filter(itemFilter(query))
        ?? [];

    return (
        <div className="section">
            <h1 className="title">Items</h1>
            <h2 className="subtitle">Search results for "{query}"</h2>

            <ItemSummaryGrid items={items} />
        </div>
    );
}

export default HighVolume;