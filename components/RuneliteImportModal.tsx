import React, { ReactElement, useEffect, useState, RefObject, useRef } from 'react';

import Link from 'next/link';

import classNames from 'classnames';
import escapeStringRegexp from 'escape-string-regexp';

import usePriceSummary from 'hooks/usePriceSummary';
import { RuneliteSession, useRuneliteGeHistory } from 'hooks/useRuneliteSession';
import { OsBuddyPriceSummary } from 'types/OsBuddy';
import { BasicItemTrade, Transaction } from 'types/Transactions';
import transactionExtractor from 'utils/TransactionExtractor';
import { TypeaheadInputElement } from './TypeaheadInput';

interface RuneliteImportModalProps {
    visible: boolean;
    session: RuneliteSession;
    transactions: Transaction<any>[];
    onTransactionsImport: (transactions: Transaction<any>[]) => void;
    onCancel: () => void;
}

const itemNameFilter = (summary: OsBuddyPriceSummary,value: string): (trade: Transaction<BasicItemTrade>) => boolean => {
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

    const inputRef:RefObject<HTMLInputElement> = useRef(null);
    useEffect(() => {
        if (!props.visible) {
            inputRef.current.value = '';
            setFilter(null);
        }
    }, [props.visible])

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
                            {transactions.filter(t => !existingTransactionIds.has(t.id)).filter(itemNameFilter(summary, filter)).map(transaction => {
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
                                ref={inputRef}
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