import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../hooks/usePriceSummary';
import { highVolumeFilter as filter } from '../filters';

import '../styles.scss';
import ItemSummaryGrid from '../components/itemSummaryGrid';

const HighVolume: NextPage = function () {
    const { summary } = usePriceSummary();
    const items = summary?.getItems()
        ?.filter(filter)
        ?? [];

    return (
        <div className="section">
            <h1 className="title">Items</h1>
            <h2 className="subtitle">High Volume</h2>

            <ItemSummaryGrid items={items} />
        </div>
    );
}

export default HighVolume;