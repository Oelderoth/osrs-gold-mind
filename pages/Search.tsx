import React from 'react';

import { NextRouter, useRouter } from 'next/router';

import escapeStringRegexp from 'escape-string-regexp';
import queryString from 'query-string';

import { OsBuddyItemSummary } from 'types/OsBuddy';
import FilteringItemPage from 'components/FilteringItemPage';

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

export default function () {
    const router = useRouter();
    const query = getQuery(router);
    return (<FilteringItemPage subtitle={`Search results for ${query}`} filter={itemFilter(query)} />)
}