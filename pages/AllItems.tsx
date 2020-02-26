import React from 'react';

import FilteringItemPage from 'components/FilteringItemPage';

const allItemsFilter = (): boolean => true

export default function () {
    return (<FilteringItemPage pageKey={'all-items'} subtitle={'All Items'} filter={allItemsFilter} />)
}