import React, { useContext, useState } from 'react';

import FilteringItemPage, { ItemFilter } from 'components/FilteringItemPage';
import { ItemsContext } from 'context/ItemsContext';
import { OsBuddyItemSummary } from 'types/OsBuddy';

const favoriteFilter = (favorites: Set<string>): ItemFilter => {
    return (item: OsBuddyItemSummary) => favorites.has(item.id.toString());
} 

export default function () {
    const { favorites } = useContext(ItemsContext);
    const [cachedFavorites] = useState(favorites);

    return (<FilteringItemPage subtitle={'Highest Margin Items'} filter={favoriteFilter(cachedFavorites)} />)
}