import React from 'react';

import FilteringItemPage from 'components/FilteringItemPage';
import whitelistItemFilter from 'utils/WhitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /logs$/i,
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Logs'} filter={whitelistItemFilter(itemWhitelist)} />);
};