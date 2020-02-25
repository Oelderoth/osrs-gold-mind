import { useContext, useState } from 'react';

import { NextPage } from 'next';
import Link from 'next/link';

import classNames from 'classnames';

import FavoriteStar from 'components/FavoriteStar';
import { TransactionContext } from 'context/TransactionsContext';
import usePriceSummary from 'hooks/usePriceSummary';
import { OsBuddyPriceSummary } from 'types/OsBuddy';
import { BasicItemTrade, Transaction, TransactionType } from 'types/Transactions';

class ItemSummary {
    constructor(
        public itemId: string,
        public name: string,
        public totalTransactions: number,
        public totalQuantity: number, 
        public totalProfit: number,
        public avgProfitPerTransaction: number,
        public avgProfitPerItem: number,
        public avgROI: number
    ) {}
}

const buildItemSummaries = (summary: OsBuddyPriceSummary, transactions: Transaction<any>[]): ItemSummary[] => {
    if (!summary) return [];
    const groupedTransactions = new Map<string, Transaction<BasicItemTrade>[]>();
    for (let transaction of transactions) {
        // For now, only handle BasicItemTrades
        if (transaction.transactionType === TransactionType.BASIC_ITEM_TRADE) {
            const t = transaction as Transaction<BasicItemTrade>;
            const itemId = t.trades[0].itemId;
            if (groupedTransactions.has(itemId)) {
                groupedTransactions.get(itemId).push(t);
            } else {
                groupedTransactions.set(itemId, [t]);
            }
        }
    }

    const itemSummaries = [];
    for (let [_, transactions] of groupedTransactions.entries()) {
        const itemId = transactions[0].trades[0].itemId;
        const name = summary.getItem(itemId).name;
        const totalTransactions = transactions.length;
        const totalQuantity = transactions.reduce((acc, cur) => acc + cur.trades.reduce((acc, cur) => acc + cur.quantity, 0), 0)
        const totalProfit = transactions.reduce((acc, cur) => acc + cur.trades.reduce((acc, cur) => acc + cur.profit, 0), 0)
        const avgProfitperTransaction = totalProfit / totalTransactions;
        const avgProfitPerItem = totalProfit / totalQuantity;
        const totalBuy = transactions.reduce((acc, cur) => acc + cur.trades.reduce((acc, cur) => acc + cur.buyPrice, 0), 0)
        const avgROI = totalProfit / totalBuy;

        itemSummaries.push(new ItemSummary(itemId, name, totalTransactions, totalQuantity, totalProfit, avgProfitperTransaction, avgProfitPerItem, avgROI));
    }

    return itemSummaries;
}


const MostProfitable: NextPage = function () {
    const { summary } = usePriceSummary();
    const { transactions } = useContext(TransactionContext);
    const [sortByField, setSortByField] = useState('totalProfit');
    const [sortAscending, setSortAscending] = useState(false);
    
    const sortBy = (field: string) => {
        if (sortByField === field) {
            setSortAscending(!sortAscending);
        } else {
            setSortAscending(false);
            setSortByField(field);
        }
    }

    const itemSummaries: ItemSummary[] = buildItemSummaries(summary, transactions);
    itemSummaries.sort((a, b) => {
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
        <div className="section">
            <div className="is-flex is-space-between is-align-center">
                <div>
                    <h1 className="title">Transactions</h1>
                    <h2 className="subtitle">Most Profitable Items</h2>
                </div>
            </div>
            <table className="table is-fullwidth is-hoverable">
                <thead>
                    <tr>
                        <SortableTh fieldName={'name'} colSpan={2}>Name</SortableTh>
                        <SortableTh fieldName={'totalTransactions'}>Total Transactions</SortableTh>
                        <SortableTh fieldName={'totalQuantity'}>Total Quantity</SortableTh>
                        <SortableTh fieldName={'totalProfit'}>Total Profit</SortableTh>
                        <SortableTh fieldName={'avgProfitPerTransaction'}>Profit Per Transaction (Avg)</SortableTh>
                        <SortableTh fieldName={'avgProfitPerItem'}>Profit Per Item (Avg)</SortableTh>
                        <SortableTh fieldName={'avgROI'}>ROI (Avg)</SortableTh>
                        <th>Favorite</th>
                    </tr>
                </thead>
                <tbody>
                    {itemSummaries.map(itemSummary => <tr key={itemSummary.itemId}>
                        <td><img src={`http://services.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=${itemSummary.itemId}`} /></td>
                        <td><Link href={{pathname: "/item", query:{id:itemSummary.itemId}}}><a>{itemSummary.name}</a></Link></td>
                        <td>{itemSummary.totalTransactions.toLocaleString()}</td>
                        <td>{itemSummary.totalQuantity.toLocaleString()}</td>
                        <td>
                            <span className={
                                classNames({
                                    'has-text-success': itemSummary.totalProfit >= 0,
                                    'has-text-danger': itemSummary.totalProfit < 0
                                })
                            }>{itemSummary.totalProfit >= 0 ? '+' : null}{itemSummary.totalProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </td>
                        <td>
                            <span className={
                                classNames({
                                    'has-text-success': itemSummary.avgProfitPerTransaction >= 0,
                                    'has-text-danger': itemSummary.avgProfitPerTransaction < 0
                                })
                            }>{itemSummary.avgProfitPerTransaction >= 0 ? '+' : null}{itemSummary.avgProfitPerTransaction.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </td>
                        <td>
                            <span className={
                                classNames({
                                    'has-text-success': itemSummary.avgProfitPerItem >= 0,
                                    'has-text-danger': itemSummary.avgProfitPerItem < 0
                                })
                            }>{itemSummary.avgProfitPerItem >= 0 ? '+' : null}{itemSummary.avgProfitPerItem.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </td>
                        <td>
                            <span className={
                                classNames({
                                    'has-text-success': itemSummary.avgROI >= 0,
                                    'has-text-danger': itemSummary.avgROI < 0
                                })
                            }>{itemSummary.avgROI >= 0 ? '+' : null}{(itemSummary.avgROI * 100).toLocaleString(undefined, {maximumFractionDigits: 2})}%</span>
                        </td>
                        <td>
                            <FavoriteStar id={itemSummary.itemId}/>
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    );
}

export default MostProfitable;
