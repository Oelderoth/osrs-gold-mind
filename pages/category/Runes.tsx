import React from 'react';

import FilteringItemPage from 'components/FilteringItemPage';
import whitelistItemFilter from 'utils/WhitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /\s+rune$/i,
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Runes'} filter={whitelistItemFilter(itemWhitelist)} />);
};