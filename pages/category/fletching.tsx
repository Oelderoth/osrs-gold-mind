import React from 'react';
import FilteringItemPage from '../../components/filteringItemPage';
import whitelistItemFilter from '../../utils/whitelistItemFilter';

const itemWhitelist = new Set<String|RegExp|number>([
    /(long|short)bow(\s\(.+?\))?$/i,
    /arrow$/i
]);

export default function () {
    return (<FilteringItemPage subtitle={'Category - Fletching'} filter={whitelistItemFilter(itemWhitelist)} />);
};