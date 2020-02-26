import React from 'react';

import FilteringItemPage from 'components/FilteringItemPage';
import whitelistItemFilter from 'utils/WhitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /battlestaff$/i,
    /orb$/i,
    /dragonhide$/i,
    /dragon leather$/i,
    "leather",
    "hard leather",
    "molten glass"
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Crafting'} filter={whitelistItemFilter(itemWhitelist)} />);
};