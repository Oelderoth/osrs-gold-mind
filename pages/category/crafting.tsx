import React from 'react';
import FilteringItemPage from '../../components/filteringItemPage';
import whitelistItemFilter from '../../utils/whitelistItemFilter';

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