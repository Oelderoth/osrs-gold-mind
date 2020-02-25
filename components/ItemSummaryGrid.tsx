import React, { ReactElement, useState } from 'react';

import Link from 'next/link';

import classNames from 'classnames';

import FavoriteStar from 'components/FavoriteStar';
import { OsBuddyItemSummary } from 'types/OsBuddy';

interface ItemGridProps {
    items: OsBuddyItemSummary[];
}

function itemRow(item: OsBuddyItemSummary): ReactElement {
    return <tr key={item.id}>
        <td><img src={`http://services.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=${item.id}`} /></td>
        <td><Link href={{pathname: "/item", query:{id:item.id}}}><a>{item.name}</a></Link></td>
        <td>{item.sell_average.toLocaleString()}</td>
        <td>{item.buy_average.toLocaleString()}</td>
        <td>
            <span className={
                classNames({
                    'has-text-success': item.profit >= 0,
                    'has-text-danger': item.profit < 0
                })
            }>{item.profit >= 0 ? '+' : null}{item.profit.toLocaleString()}</span>
        </td>
        <td>{`${item.returnOnInvestment.toFixed(2)}%`}</td>
        <td>{item.buy_quantity.toLocaleString()}</td>
        <td>{item.sell_quantity.toLocaleString()}</td>
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
    const [sortByField, setSortByField] = useState('profit');
    const [sortAscending, setSortAscending] = useState(false);
    
    const sortBy = (field: string) => {
        if (sortByField === field) {
            setSortAscending(!sortAscending);
        } else {
            setSortAscending(false);
            setSortByField(field);
        }
    }

    const items = props?.items ?? [];
    items.sort((a, b) => {
        const valA = a[sortByField];
        const valB = b[sortByField];
        if (typeof valA === 'number') {
            return sortAscending ? a[sortByField] - b[sortByField] : b[sortByField] - a[sortByField]
        } else {
            return sortAscending ? valB.toString().localeCompare(valA.toString()) : valA.toString().localeCompare(valB.toString());
        }
    })

    const SortableTh = (props) => {
        const {fieldName, ...other} = props;
        return (<th className='has-pointer is-hoverable' onClick={()=>sortBy(fieldName)} {...other}>
            {props.children}
            <span className="icon is-pulled-right">
                {sortByField === fieldName && <i className={classNames("fas", {'fa-sort-up': sortAscending, 'fa-sort-down': !sortAscending})} />}
            </span>
        </th>);
    }

    return (
        <table className="table is-fullwidth is-hoverable">
            <thead>
                <tr>
                    <SortableTh fieldName={'name'} colSpan={2}>Name</SortableTh>
                    <SortableTh fieldName={'sell_average'}>Offer Price</SortableTh>
                    <SortableTh fieldName={'buy_average'}>Sell Price</SortableTh>
                    <SortableTh fieldName={'profit'}>Profit</SortableTh>
                    <SortableTh fieldName={'returnOnInvestment'}>ROI</SortableTh>
                    <SortableTh fieldName={'buy_quantity'}>Buy Quantity</SortableTh>
                    <SortableTh fieldName={'sell_quantity'}>Sell Quantity</SortableTh>
                    <SortableTh fieldName={'buySellRatio'}>Buy/Sell Ratio</SortableTh>
                    <th>Favorite</th>
                </tr>
            </thead>
            <tbody>
                {items.map(itemRow)}
            </tbody>
        </table>
    );
}

export default ItemSummaryGrid;