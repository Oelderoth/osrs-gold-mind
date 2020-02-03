import React, { ReactElement } from 'react';
import Link from 'next/link';
import { OsBuddyItemSummary } from '../types/osbuddy';

import '../styles.scss';

interface ItemGridProps {
    items: OsBuddyItemSummary[];
}

function itemRow(item: OsBuddyItemSummary): ReactElement {
    console.log(item.isUpToDate)
    return <tr key={item.id}>
        <td>{item.id}</td>
        <td><Link href={{pathname: "/item", query:{id:item.id}}}><a>{item.name}</a></Link></td>
        <td>{item.sell_average}</td>
        <td>{item.buy_average}</td>
        <td>{item.profit}</td>
        <td>{`${item.returnOnInvestment.toFixed(2)}%`}</td>
        <td>{item.buy_quantity}</td>
        <td>{item.sell_quantity}</td>
        <td>{item.buySellRatio.toFixed(2)}</td>
    </tr>
}

const ItemSummaryGrid = function (props: ItemGridProps): ReactElement {
    return (
        <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Offer Price</th>
                    <th>Sell Price</th>
                    <th>Profit</th>
                    <th>ROI</th>
                    <th>Buy Quantity</th>
                    <th>Sell Quantity</th>
                    <th>Buy/Sell Ratio</th>
                </tr>
            </thead>
            <tbody>
                {props.items.map(itemRow)}
            </tbody>
        </table>
    );
}

export default ItemSummaryGrid;