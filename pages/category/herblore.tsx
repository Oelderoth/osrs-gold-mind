import React from 'react';
import FilteringItemPage from '../../components/filteringItemPage';
import whitelistItemFilter from '../../utils/whitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /^grimy/i,
    /potion \(unf\)$/i
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Herblore'} filter={whitelistItemFilter(itemWhitelist)} />);
};