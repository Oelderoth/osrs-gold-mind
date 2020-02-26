import React from 'react';

import FilteringItemPage from 'components/FilteringItemPage';
import whitelistItemFilter from 'utils/WhitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /\s+impling\sjar$/i,
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Implings'} filter={whitelistItemFilter(itemWhitelist)} />);
};