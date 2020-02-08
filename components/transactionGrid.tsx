import React, { ReactElement } from 'react';
import Link from 'next/link';
import { OsBuddyItemSummary, OsBuddyPriceSummary } from '../types/osbuddy';
import classNames from 'classnames';

import '../styles.scss';
import FavoriteStar from './favoriteStar';
import { Transaction } from '../context/TransactionsContext';
import usePriceSummary from '../hooks/usePriceSummary';

interface TransactionGridProps {
    transactions: Transaction[];
    onDeleteTransaction: (transaction: Transaction) => void;
}

function transactionRow(summary: OsBuddyPriceSummary, deleteTransaction: (transaction:Transaction) => void): (transaction: Transaction) => ReactElement {
    return (transaction: Transaction) => {
        if (!summary) return;
        const item = summary.getItem(transaction.itemId);
        const profitClassName = classNames({
            'has-text-success': transaction.profit >= 0,
            'has-text-danger': transaction.profit < 0
        });
        return (<tr key={transaction.id}>
            <td><img src={`http://services.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=${item.id}`} /></td>
            <td><Link href={{pathname: "/item", query:{id:item.id}}}><a>{item.name}</a></Link></td>
            <td>{transaction.quantity.toLocaleString()}</td>
            <td>{transaction.buyPrice.toLocaleString()}</td>
            <td>{transaction.sellPrice.toLocaleString()}</td>
            <td>
                <span className={profitClassName}>{transaction?.profit >= 0 ? '+' : null}{transaction.returnOnInvestment.toFixed(2)}%</span>
            </td>
            <td>
                <span className={profitClassName}>{transaction?.profit >= 0 ? '+' : null}{transaction.profitPerItem.toLocaleString()}</span>
            </td>
            <td>
                <span className={profitClassName}>{transaction?.profit >= 0 ? '+' : null}{transaction.profit.toLocaleString()}</span>
            </td>
            <td>{new Date(transaction.sell_ts).toLocaleString()}</td>
            <td className="has-text-centered">
                <span className='icon has-pointer' onClick={() => {
                    deleteTransaction(transaction);
                }}><i className='fas fa-trash' /></span>
            </td>
        </tr>);
    }
}

const TransactionGrid = function (props: TransactionGridProps): ReactElement {
    const { summary } = usePriceSummary();

    return (
        <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
                <tr>
                    <th colSpan={2}>Name</th>
                    <th>Quantity</th>
                    <th>Buy Price</th>
                    <th>Sell Price</th>
                    <th>ROI</th>
                    <th>Profit (Per Item)</th>
                    <th>Profit (Total)</th>
                    <th>Date</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                {props.transactions.map(transactionRow(summary, props.onDeleteTransaction))}
            </tbody>
        </table>
    );
}

export default TransactionGrid;