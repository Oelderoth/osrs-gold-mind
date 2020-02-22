import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../../types/osbuddy';

import '../../styles.scss';
import ItemSummaryGrid from '../../components/itemSummaryGrid';

const itemWhitelist = new Set<String>([]);

const filter = (item: OsBuddyItemSummary): boolean => {
    return itemWhitelist.has(item.name.toLowerCase());
}

const RunesCategoryPage: NextPage = function () {
    const { summary } = usePriceSummary();
    const items = summary?.getItems()
        ?.filter(filter)
        ?? [];

    return (
        <div className="section">
            <h1 className="title">Items</h1>
            <h2 className="subtitle">Category - Runes</h2>

            <ItemSummaryGrid items={items} />
        </div>
    );
}

export default RunesCategoryPage;