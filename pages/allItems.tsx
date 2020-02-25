import React from 'react';

import FilteringItemPage from 'components/FilteringItemPage';

const allItemsFilter = (): boolean => true

export default function () {
    return (<FilteringItemPage subtitle={'All Items'} filter={allItemsFilter} />)
}