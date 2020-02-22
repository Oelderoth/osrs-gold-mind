import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../../types/osbuddy';

import '../../styles.scss';
import ItemSummaryGrid from '../../components/itemSummaryGrid';

const itemWhitelist = new Set<String|RegExp|number>([
    /battlestaff$/ig,
    /orb$/ig,
    /dragonhide$/ig,
    /dragon leather$/ig,
    "leather",
    "hard leather",
    "molten glass"
]);

const filter = (item: OsBuddyItemSummary): boolean => {
    for (let val of itemWhitelist.values()) {
        if (val instanceof RegExp) {
            if (val.test(item.name)) {
                return true;
            }
        } else if (typeof val === 'number') {
            if (val === item.id) {
                return true;
            }
        }
    }
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