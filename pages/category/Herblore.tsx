import React from 'react';

import FilteringItemPage from 'components/FilteringItemPage';
import whitelistItemFilter from 'utils/WhitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /^grimy/i,
    /potion \(unf\)$/i
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Herblore'} filter={whitelistItemFilter(itemWhitelist)} />);
};