import React, { ReactElement } from 'react';
import Link from 'next/link';
import { OsBuddyItemSummary } from '../types/osbuddy';
import classNames from 'classnames';

import '../styles.scss';
import FavoriteStar from './favoriteStar';

interface ItemGridProps {
    items: OsBuddyItemSummary[];
}

function ConditionalColoredSpan(props): ReactElement {
    const {value, threshold, prefixes, className, ...other} = props;
    return (
        <span className={classNames(className, {
            'has-text-success': value >= threshold,
            'has-text-danger': value < threshold
        })} {...other}>
            {prefixes ? value >= threshold ? prefixes[0] : prefixes[1] : null}{value}
        </span>
    )
}

function itemRow(item: OsBuddyItemSummary): ReactElement {
    return <tr key={item.id}>
        <td>{item.id}</td>
        <td><Link href={{pathname: "/item", query:{id:item.id}}}><a>{item.name}</a></Link></td>
        <td>{item.sell_average}</td>
        <td>{item.buy_average}</td>
        <td><ConditionalColoredSpan value={item.profit} threshold={0} prefixes={['+','-']}/></td>
        <td>{`${item.returnOnInvestment.toFixed(2)}%`}</td>
        <td>{item.buy_quantity}</td>
        <td>{item.sell_quantity}</td>
        <td><ConditionalColoredSpan value={item.buySellRatio.toFixed(2)} threshold={1.0}/></td>
        <td><FavoriteStar id={item.id.toString()}/></td>
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