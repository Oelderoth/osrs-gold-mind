import React from 'react';
import FilteringItemPage from '../../components/filteringItemPage';
import whitelistItemFilter from '../../utils/whitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /logs$/i,
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Logs'} filter={whitelistItemFilter(itemWhitelist)} />);
};