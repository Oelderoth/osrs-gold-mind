import React from 'react';
import FilteringItemPage from '../../components/filteringItemPage';
import whitelistItemFilter from '../../utils/whitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /\s+seed$/i
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Farming'} filter={whitelistItemFilter(itemWhitelist)} />);
};