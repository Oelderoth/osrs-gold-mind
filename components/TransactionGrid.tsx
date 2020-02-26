import React, { ReactElement, useState } from 'react';

import Link from 'next/link';

import classNames from 'classnames';

import usePriceSummary from 'hooks/usePriceSummary';
import { OsBuddyPriceSummary } from 'types/OsBuddy';
import {
    BasicItemTrade, BasicItemTransaction, Transaction, TransactionType
} from 'types/Transactions';
import { SortableTable, SortableTh, SortableRows } from './SortableTable';

interface TransactionGridProps {
    transactions: Transaction<any>[];
    onDeleteTransaction: (transaction: Transaction<any>) => void;
}

function basicItemTradeRow(summary: OsBuddyPriceSummary, deleteTransaction: (transaction:Transaction<BasicItemTrade>) => void, transaction: BasicItemTransaction, showDetails: boolean, onClick: (e:React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void): ReactElement {
    if (!summary) return;
    const item = summary.getItem(transaction.trades[0].itemId);
    const profitClassName = classNames({
        'has-text-success': transaction.profit >= 0,
        'has-text-danger': transaction.profit < 0
    });
    const quantity = transaction.trades.reduce((acc, cur) => acc + cur.quantity, 0);
    return (<React.Fragment key={transaction.id}>
        <tr className='has-pointer' onClick={e => onClick?.(e)}>
            <td><img src={`http://services.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=${item.id}`} /></td>
            <td><Link href={{pathname: "/item", query:{id:item.id}}}><a>{item.name}</a></Link></td>
            <td>{quantity.toLocaleString()}</td>
            <td>{transaction.buyPrice.toLocaleString()}</td>
            <td>{transaction.sellPrice.toLocaleString()}</td>
            <td>
                <span className={profitClassName}>{transaction?.profit >= 0 ? '+' : null}{transaction.profit.toLocaleString()}</span>
            </td>
            <td>
                <span className={profitClassName}>{transaction?.profit >= 0 ? '+' : null}{transaction.ROI.toFixed(2)}%</span>
            </td>
            <td>{new Date(transaction.endTime).toLocaleString()}</td>
            <td className="has-text-centered">
                <span className='icon has-pointer' onClick={() => {
                    deleteTransaction(transaction);
                }}><i className='fas fa-trash' /></span>
            </td>
        </tr>
        <tr className={classNames("is-background", {'is-hidden': !showDetails})}>
            <td></td>
            <td colSpan={8}>
                <table className="table is-bordered is-striped is-hoverable is-fullwidth is-narrow">
                    <thead>
                        <tr>
                            <th>Quantity</th>
                            <th>Buy Price</th>
                            <th>Sell Price</th>
                            <th>ROI</th>
                            <th>Profit (per Item)</th>
                            <th>Profit (Total)</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    {transaction.trades.map(trade => (
                        <tr key={trade.id}>
                            <td>
                                {trade.quantity.toLocaleString()}
                            </td>
                            <td>
                                {(trade.buyPrice / trade.quantity).toLocaleString()}
                            </td>
                            <td>
                                {(trade.sellPrice / trade.quantity).toLocaleString()}
                            </td>
                            <td>
                                {`${trade.ROI.toFixed(2)}%`}
                            </td>
                            <td>
                                {trade.profitPerItem.toLocaleString()}
                            </td>
                            <td>
                                {trade.profit.toLocaleString()}
                            </td>
                            <td>
                                {new Date(trade.endTime).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </table>
            </td>
        </tr>
    </React.Fragment>);
}

function transactionRow(summary: OsBuddyPriceSummary, deleteTransaction: (transaction:Transaction<any>) => void, displayedSummary: string, setDisplayedSummary: (summary: string) => void): (transaction: Transaction<any>) => ReactElement {
    return (transaction: Transaction<any>) => {
        switch (transaction.transactionType) {
            case TransactionType.BASIC_ITEM_TRADE:
                return basicItemTradeRow(summary, deleteTransaction, transaction as BasicItemTransaction, transaction.id === displayedSummary, () => {
                    if (displayedSummary === transaction.id) {
                        setDisplayedSummary(null);
                    } else {
                        setDisplayedSummary(transaction.id);
                    }
                });
            default:
                return null;
        }
    }
}

const TransactionGrid = function (props: TransactionGridProps): ReactElement {
    const [displayedSummary, setDisplayedSummary] = useState(null);
    const { summary } = usePriceSummary();

    const valueExtractor = (obj: Transaction<any>, fieldName: string): any => {
        switch (fieldName) {
            case 'name':
                return obj.transactionType === TransactionType.BASIC_ITEM_TRADE ? 
                    summary?.getItem((obj as BasicItemTransaction).trades[0].itemId)?.name ?? 'Unknown'
                    : obj[fieldName];
            case 'quantity':
                return obj.transactionType === TransactionType.BASIC_ITEM_TRADE ? 
                    (obj as BasicItemTransaction).trades.reduce((acc, cur) => acc + cur.quantity, 0)
                    : obj[fieldName];
            default:
                return obj[fieldName];
        }
    }

    return (
        <SortableTable className="table is-fullwidth is-hoverable" 
            defaultField={'endTime'} 
            defaultAscending={false}
            pageSize={30}>
            <thead>
                <tr>
                    <SortableTh fieldName={'name'} colSpan={2}>Name</SortableTh>
                    <SortableTh fieldName={'quantity'}>Quantity</SortableTh>
                    <SortableTh fieldName={'buyPrice'}>Buy Price</SortableTh>
                    <SortableTh fieldName={'sellPrice'}>Sell Price</SortableTh>
                    <SortableTh fieldName={'profit'}>Profit (Total)</SortableTh>
                    <SortableTh fieldName={'ROI'}>ROI</SortableTh>
                    <SortableTh fieldName={'endTime'}>Date</SortableTh>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                <SortableRows items={props?.transactions ?? []} 
                    rowMapper={transactionRow(summary, props.onDeleteTransaction, displayedSummary, setDisplayedSummary)} 
                    valueExtractor={valueExtractor}/>
            </tbody>
        </SortableTable>
    );
}

export default TransactionGrid;