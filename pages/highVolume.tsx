import React, { ReactElement } from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../types/osbuddy';
import {highVolumeFilter} from '../filters';

import '../styles.scss';

function profitMarginSort(itemA: OsBuddyItemSummary, itemB: OsBuddyItemSummary): number {
    return (itemB.buy_average - itemB.sell_average) - (itemA.buy_average - itemA.sell_average);
}

function itemRow(item: OsBuddyItemSummary): ReactElement {
    return <tr key={item.id}>
        <td>{item.id}</td>
        <td>{item.name}</td>
        <td>{item.buy_average}</td>
        <td>{item.sell_average}</td>
        <td>{item.buy_average - item.sell_average}</td>
        <td>{`${((item.buy_average - item.sell_average)/item.sell_average*100).toFixed(2)}%`}</td>
        <td>{item.buy_quantity}</td>
        <td>{item.sell_quantity}</td>
        <td>{(item.sell_quantity / item.buy_quantity).toFixed(2)}</td>
    </tr>
}

const HighVolume: NextPage = function () {
    const {summary} = usePriceSummary();
    const items = summary?.getItems()
        ?.filter(highVolumeFilter)
        ?.sort(profitMarginSort)
        ?? [];

    return (
        <div className="section">
            <h1 className="title">Items</h1>
            <h2 className="subtitle">High Volume</h2>

            <div className="container">
                <table className="table is-fullwidth is-striped is-hoverable">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Buy Price</th>
                            <th>Sell Price</th>
                            <th>Profit</th>
                            <th>ROI</th>
                            <th>Buy Quantity</th>
                            <th>Sell Quantity</th>
                            <th>Buy/Sell Ratio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(itemRow)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HighVolume;