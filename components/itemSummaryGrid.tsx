import React, { ReactElement } from 'react';
import Link from 'next/link';
import { OsBuddyItemSummary } from '../types/osbuddy';
import classNames from 'classnames';

import '../styles.scss';
import FavoriteStar from './favoriteStar';
import ConditionalSpan from './conditionalSpan';

interface ItemGridProps {
    items: OsBuddyItemSummary[];
}

function itemRow(item: OsBuddyItemSummary): ReactElement {
    return <tr key={item.id}>
        <td><img src={`http://services.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=${item.id}`} /></td>
        <td><Link href={{pathname: "/item", query:{id:item.id}}}><a>{item.name}</a></Link></td>
        <td>{item.sell_average}</td>
        <td>{item.buy_average}</td>
        <td>
            <span className={
                classNames({
                    'has-text-success': item.profit >= 0,
                    'has-text-danger': item.profit < 0
                })
            }>{item.profit >= 0 ? '+' : '-'}{item.profit.toLocaleString()}</span>
        </td>
        <td>{`${item.returnOnInvestment.toFixed(2)}%`}</td>
        <td>{item.buy_quantity}</td>
        <td>{item.sell_quantity}</td>
        <td>
            <span className={
                classNames({
                    'has-text-success': item.buySellRatio > 1,
                    'has-text-danger': item.buySellRatio <= 1
                })
            }>{item.buySellRatio.toFixed(2)}</span>
        </td>
        <td className="has-text-centered"><FavoriteStar id={item.id.toString()}/></td>
    </tr>
}

const ItemSummaryGrid = function (props: ItemGridProps): ReactElement {
    return (
        <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
                <tr>
                    <th colSpan={2}>Name</th>
                    <th>Offer Price</th>
                    <th>Sell Price</th>
                    <th>Profit</th>
                    <th>ROI</th>
                    <th>Buy Quantity</th>
                    <th>Sell Quantity</th>
                    <th>Buy/Sell Ratio</th>
                    <th>Favorite</th>
                </tr>
            </thead>
            <tbody>
                {props.items.map(itemRow)}
            </tbody>
        </table>
    );
}

export default ItemSummaryGrid;