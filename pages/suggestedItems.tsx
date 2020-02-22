import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../types/osbuddy';
import { suggestedItemFilter as filter } from '../filters';

import '../styles.scss';
import ItemSummaryGrid from '../components/itemSummaryGrid';

function profitMarginSort(itemA: OsBuddyItemSummary, itemB: OsBuddyItemSummary): number {
    return (itemB.buy_average - itemB.sell_average) - (itemA.buy_average - itemA.sell_average);
}

const SuggestedItems: NextPage = function () {
    const { summary } = usePriceSummary();
    const items = summary?.getItems()
        ?.filter(filter)
        ?? [];

    return (
        <div className="section">
            <h1 className="title">Items</h1>
            <h2 className="subtitle">Suggested Items</h2>

            <ItemSummaryGrid items={items} />
        </div>
    );
}

export default SuggestedItems;