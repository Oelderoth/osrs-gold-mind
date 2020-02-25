import React, { ReactElement, useEffect, useState } from 'react';

import Link from 'next/link';

import classNames from 'classnames';
import escapeStringRegexp from 'escape-string-regexp';

import usePriceSummary from 'hooks/usePriceSummary';
import { RuneliteSession, useRuneliteGeHistory } from 'hooks/useRuneliteSession';
import { OsBuddyPriceSummary } from 'types/OsBuddy';
import { BasicItemTrade, Transaction } from 'types/Transactions';
import transactionExtractor from 'utils/TransactionExtractor';

interface RuneliteImportModalProps {
    visible: boolean;
    session: RuneliteSession;
    transactions: Transaction<any>[];
    onTransactionsImport: (transactions: Transaction<any>[]) => void;
    onCancel: () => void;
}

// const findTransactions = (geHistory: RuneliteGrandExchangeTrade[]): Transaction<any>[] => {
//     if (!geHistory) return [];

//     // Map<[itemId, price], trades[]>
//     const groupedTrades:  Map<number, RuneliteGrandExchangeTrade[]> = new Map();
//     let transactions: Transaction<any>[] = [];
        
//     // Group trades by itemId
//     for (let trade of geHistory) {
//         if (groupedTrades.has(trade.itemId)) {
//             groupedTrades.get(trade.itemId).push(trade);
//         } else {
//             groupedTrades.set(trade.itemId, [trade]);
//         }
//     }

//     for (let [key, trades] of groupedTrades.entries()) {
//         // Sort from latest to earliest
//         trades.sort((a, b) => b.time.seconds - a.time.seconds);

//         const sales = trades.filter(trade => !trade.buy);
//         let buys = trades.filter(trade => trade.buy);

//         let potentialTransactions = []

//         for (const sale of sales) {
//             let remainingQuantity = sale.quantity;
//             //We have a sale, see if we can piece together a group of buys of the same quantity
//             for (let i = 0; i < buys.length; i++) {
//                 const buy = buys[i];
//                 if (buy.time.seconds >= sale.time.seconds) continue;

//                 if (buy.quantity <= remainingQuantity) {
//                     // If the buy is less than the sale, create a transaction for the entire buy
//                     const id = `${sale.itemId}:${buy.quantity}:${buy.time.seconds*1000}:${sale.time.seconds*1000}`
//                     const transaction = new Transaction(id, buy.time.seconds * 1000, sale.time.seconds * 1000, sale.itemId.toString(), buy.quantity, buy.price, sale.price);
//                     potentialTransactions.push(transaction)
//                     remainingQuantity -= buy.quantity;
//                     // Remove the now expended buy from the list
//                     buys = buys.filter((b) => b != buy);
//                     i--;
//                     // If no more to buy, move on to next sale
//                     if (remainingQuantity === 0) break;
//                 } else {
//                     // If the buy is more than the sale, create a transaction for the remaining sale
//                     const id = `${sale.itemId}:${remainingQuantity}:${buy.time.seconds*1000}:${sale.time.seconds*1000}`
//                     const transaction = new Transaction(id, buy.time.seconds * 1000, sale.time.seconds * 1000, sale.itemId.toString(), remainingQuantity, buy.price, sale.price);
//                     potentialTransactions.push(transaction)
//                     // Reduce the buy's quantity by the appropriate amount
//                     buy.quantity -= remainingQuantity;
//                     // And stop iterating
//                     break;
//                 }
//             }
//         }
//         // Group trades with the same buy/sell price
//         const sameTrades:Map<string, Transaction[]> = new Map();
//         for (const transaction of potentialTransactions) {
//             const key: string = [transaction.buyPrice, transaction.sellPrice].join(';');
//             if (sameTrades.has(key)) {
//                 sameTrades.get(key).push(transaction);
//             } else {
//                 sameTrades.set(key, [transaction]);
//             }
//         }

//         // Rebuild transactions combining trades w/ the same price within 2 hours of eachother
//         potentialTransactions = [];
//         for (const [key, tr] of sameTrades.entries()) {
//             let trades = [...tr];
//             console.log(`Potentially collapsing ${tr.length} trades`)
//             for (let i = 0; i < trades.length; i++) {
//                 const transaction = trades[i];
//                 const transactionsToCollapse = trades.filter(t => Math.abs(t.sell_ts - transaction.sell_ts) <= 60*60*6*1000)
//                 const earliest_buy_ts = transactionsToCollapse.reduce((acc, cur) => cur.buy_ts < acc ? cur.buy_ts : acc, transaction.buy_ts);
//                 const latest_sell_ts = transactionsToCollapse.reduce((acc, cur) => cur.sell_ts > acc ? cur.sell_ts : acc, transaction.sell_ts);;
//                 const quantity = transactionsToCollapse.reduce((acc, cur) => cur.quantity + acc, 0);
//                 const id = `${transaction.itemId}:${quantity}:${earliest_buy_ts}:${latest_sell_ts}`
//                 const newTransaction = new Transaction(id, earliest_buy_ts, latest_sell_ts, transaction.itemId, quantity, transaction.buyPrice, transaction.sellPrice);
//                 potentialTransactions.push(newTransaction);
//                 for (const collapsedTrade of transactionsToCollapse) {
//                     trades = trades.filter(trade => trade != collapsedTrade);
//                 }
//             }
//         }


//         transactions.push(...potentialTransactions);
//     }

//     transactions = transactions
//         .filter(t => !(t.quantity === 1 && t.buyPrice > t.sellPrice))
//         .sort((a, b) => (b.sell_ts != a.sell_ts) ? b.sell_ts - a.sell_ts : b.buy_ts - a.buy_ts);


//     return transactions;
// }




const tradeFilter = (summary: OsBuddyPriceSummary,value: string): (trade: Transaction<BasicItemTrade>) => boolean => {
    if (!summary || !value || value.length == 0) return () => true;

    const escaped = escapeStringRegexp(value).replace(/\s+/g, '.+?');
    const regex = new RegExp(escaped, 'i')
    
    return (trade) => regex.test(summary.getItem(trade.trades[0].itemId)?.name);
}

const RuneliteImportModal = (props: RuneliteImportModalProps): ReactElement => {
    const { summary } = usePriceSummary();
    const geHistory = useRuneliteGeHistory(props?.session);
    const existingTransactionIds = new Set(props?.transactions?.map(t => t.id));

    const [ selectedTransactions, setSelectedTransactions ] = useState([]);
    const [ transactions, setTransactions ] = useState([]);
    const [ filter, setFilter ] = useState(null);

    useEffect(() => {
        const extractedTransactions = transactionExtractor(geHistory);
        extractedTransactions.sort((a, b) => b.endTime - a.endTime);
        setTransactions(extractedTransactions);
    }, [geHistory])

    const toggleTransaction = (transaction: Transaction<any>) => {
        if (selectedTransactions.find(t => t.id === transaction.id)) {
            setSelectedTransactions(selectedTransactions.filter(t => t.id !== transaction.id));
        } else {
            setSelectedTransactions([...selectedTransactions, transaction]);
        }
    }

    return (<div className={classNames('modal', {
        'is-active': props.visible
    })}>
        <div className="modal-background" onClick={props?.onCancel}></div>
        <div className="modal-content is-overflow-hidden">
            <div className="panel is-overflow-hidden is-flex is-flex-direction-column is-max-height-100">
                <p className="panel-heading is-flex-none">Import Runelite Transactions</p>
                <div className="panel-block is-overflow-auto is-flex is-align-flex-start">
                    <table className="table is-fullwidth is-striped is-hoverable">
                        <thead>
                            <tr>
                                <th colSpan={2}>Name</th>
                                <th>Quantity</th>
                                <th>Buy Price</th>
                                <th>Sell Price</th>
                                <th>Import</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.filter(t => !existingTransactionIds.has(t.id)).filter(tradeFilter(summary, filter)).map(transaction => {
                                if (!summary) return;
                                const item = summary.getItem(transaction.trades[0].itemId);
                                return (<tr className="has-pointer" onClick={() => toggleTransaction(transaction)}>
                                    <td><img src={`http://services.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=${item.id}`} /></td>
                                    <td><Link href={{pathname: "/item", query:{id:transaction.trades[0].itemId}}}><a>{item.name}</a></Link></td>
                                    <td>{transaction.trades.reduce((acc, cur) => acc + cur.quantity, 0).toLocaleString()}</td>
                                    <td>{transaction.buyPrice.toLocaleString()}</td>
                                    <td>{transaction.sellPrice.toLocaleString()}</td>
                                    <td className="has-text-centered"><input type="checkbox" checked={selectedTransactions.find(t => t.id === transaction.id)} onChange={() => toggleTransaction(transaction)}/></td>
                                </tr>);
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="panel-block is-flex is-space-between is-flex-none">
                    <div>
                        <div className="control has-icons-left">
                            <input type="text"
                                className="input is-small"
                                placeholder="Filter by item..." 
                                onChange={(e) => {
                                    setFilter(e.target.value);
                                }} />
                            <span className="icon is-small is-left">
                                <i className="fas fa-search" />
                            </span>
                        </div>
                    </div>
                    <div className="buttons">
                        <button className={classNames("button is-small is-primary")} onClick={() => props?.onTransactionsImport?.(selectedTransactions)}>Import Selected Transaction</button>
                        <button className="button is-small" onClick={() => props?.onCancel?.()}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={props?.onCancel}></button>
    </div>);
}

export default RuneliteImportModal;