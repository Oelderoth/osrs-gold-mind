import React from 'react';
import FilteringItemPage from '../../components/filteringItemPage';
import whitelistItemFilter from '../../utils/whitelistItemFilter';

const itemWhitelist = new Set<String>([]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Construction'} filter={whitelistItemFilter(itemWhitelist)} />);
};