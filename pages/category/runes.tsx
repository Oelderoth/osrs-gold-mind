import React from 'react';
import FilteringItemPage from '../../components/filteringItemPage';
import whitelistItemFilter from '../../utils/whitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /\s+rune$/i,
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Runes'} filter={whitelistItemFilter(itemWhitelist)} />);
};