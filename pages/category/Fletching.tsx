import React from 'react';

import FilteringItemPage from 'components/FilteringItemPage';
import whitelistItemFilter from 'utils/WhitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /(long|short)bow(\s\(.+?\))?$/i,
    /arrow$/i
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Fletching'} filter={whitelistItemFilter(itemWhitelist)} />);
};