import React from 'react';

import FilteringItemPage from 'components/FilteringItemPage';
import whitelistItemFilter from 'utils/WhitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /\s+seed$/i
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Farming'} filter={whitelistItemFilter(itemWhitelist)} />);
};