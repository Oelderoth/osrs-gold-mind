import React, { useState, useContext, useEffect } from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../types/osbuddy';

import '../styles.scss';
import ItemSummaryGrid from '../components/itemSummaryGrid';
import { ItemsContext } from '../context/ItemsContext';

function profitMarginSort(itemA: OsBuddyItemSummary, itemB: OsBuddyItemSummary): number {
    return (itemB.buy_average - itemB.sell_average) - (itemA.buy_average - itemA.sell_average);
}

const FavoriteItems: NextPage = function () {
    const { favorites } = useContext(ItemsContext);
    // Cache the favorites on first load so that items may be un-favorited but won't disppear until reloading the page
    const [cachedFavorites] = useState(favorites);

    const { summary } = usePriceSummary();
    const items = summary?.getItems()
        ?.filter(item => cachedFavorites?.has(item.id.toString()) ?? false)
        ?.sort(profitMarginSort)
        ?? [];

    return (
        <div className="section">
            <h1 className="title">Items</h1>
            <h2 className="subtitle">Favorite Items</h2>

            <ItemSummaryGrid items={items} />
        </div>
    );
}

export default FavoriteItems;