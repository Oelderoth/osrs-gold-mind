import React, { ReactElement, Fragment, ReactNode, useEffect, useState } from 'react';

import { NextPage } from 'next';

import classNames from 'classnames';

import useRuneliteSession, { RuneliteSessionStatus, useRuneliteGeHistory, RuneliteGrandExchangeTrade } from 'hooks/useRuneliteSession';
import { SortableTable, SortableTh, SortableRows } from 'components/SortableTable';
import { OsBuddyItemSummary, OsBuddyPriceSummary } from 'types/OsBuddy';
import usePriceSummary from 'hooks/usePriceSummary';
import { transcode } from 'buffer';
import ItemSearchFilter from 'utils/ItemSearchFilter';

const rowMapper = (summary: OsBuddyPriceSummary) => {
    return (trade: RuneliteGrandExchangeTrade): ReactNode => {
        if (!summary) return;
        return (<tr key={`${trade.buy}:${trade.time.seconds}:${trade.itemId}:${trade.quantity}`}>
            <td><img className={'item-icon-small'} src={`http://services.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=${trade.itemId}`} /></td>
            <td>{summary.getItem(trade.itemId)?.name ?? 'Unknown'}</td>
            <td>{trade.buy ? 'Bought' : 'Sold'}</td>
            <td>{trade.quantity.toLocaleString()}</td>
            <td>{(trade.price * trade.quantity).toLocaleString()}</td>
            <td>{trade.price.toLocaleString()}</td>
            <td>{new Date(trade.time.seconds*1000).toLocaleString()}</td>
        </tr>)
    }
}

const valueExtractor = (summary: OsBuddyPriceSummary) => {
    return (trade: RuneliteGrandExchangeTrade, fieldName: string): any => {
        switch (fieldName) {
            case 'name':
                return summary.getItem(trade.itemId)?.name ?? '';
            case 'time':
                return trade.time.seconds * 1000;
            case 'totalPrice':
                return trade.price * trade.quantity
            default:
                return trade[fieldName];
        }
    }
}

const TradeHistory: NextPage = (props): ReactElement => {
    const { summary } = usePriceSummary();
    const { session, login } = useRuneliteSession();
    const history = useRuneliteGeHistory(session);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [itemNameFilter, setItemNameFilter] = useState('');

    useEffect(() => {
        if (!summary || !history) return;

        const searchFilter = ItemSearchFilter(itemNameFilter, true);
        setFilteredHistory([...history].filter(trade => searchFilter(summary.getItem(trade.itemId)?.name ?? '')));
    }, [history, itemNameFilter, summary]);

    return (
        <div className="section">
            <div>
                <h1 className="title">Transactions</h1>
                <h2 className="subtitle">Grand Exchange Trade History</h2>
            </div>
            <SortableTable 
                pageSize={25} 
                className="table is-fullwidth is-hoverable" 
                defaultField={'time'} 
                defaultAscending={false}
                headerContent={<div className="is-flex is-flex-end field">
                        <div className="control">
                            <input type="text" className="input is-small" placeholder="Filter by item..." onChange={(e) => setItemNameFilter(e.target.value)}/>
                        </div>
                    </div>}>
                <thead>
                    <tr>
                        <SortableTh fieldName={'name'} colSpan={2}>Name</SortableTh>
                        <th>Buy/Sell</th>
                        <SortableTh fieldName={'quantity'}>Quantity</SortableTh>
                        <SortableTh fieldName={'totalPrice'}>Total Price</SortableTh>
                        <SortableTh fieldName={'price'}>Price</SortableTh>
                        <SortableTh fieldName={'time'}>Date</SortableTh>
                    </tr>
                </thead>
                <tbody>
                    {session.status === RuneliteSessionStatus.LOGGED_IN && (
                        <SortableRows items={filteredHistory} rowMapper={rowMapper(summary)} valueExtractor={valueExtractor(summary)} />
                    )}
                </tbody>
            </SortableTable>
            
            {session?.status !== RuneliteSessionStatus.LOGGED_IN && (
                <Fragment>
                    <div className="has-text-centered">
                        {session.status === RuneliteSessionStatus.LOGGED_OUT && <div className="text has-margin">You must be logged into RuneLite to view your Grand Exchange Trade History</div>}
                        {session.status === RuneliteSessionStatus.LOGGING_IN && <div className="text has-margin">Attempting to log into RuneLite</div>}
                        {session.status === RuneliteSessionStatus.ERROR && <div className="text has-margin has-text-danger">An error occured while trying to log into RuneLite. Please try again</div>}
                        <button className={classNames("button", {
                            'is-primary': session?.status != RuneliteSessionStatus.ERROR,
                            'is-loading': session?.status === RuneliteSessionStatus.LOGGING_IN,
                            'is-danger': session?.status === RuneliteSessionStatus.ERROR
                        })} onClick={() => login()}>Log Into RuneLite</button>
                    </div>
                </Fragment>
            )}
        </div>
    )
}

export default TradeHistory;