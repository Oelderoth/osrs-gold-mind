import React, { ReactElement } from 'react';

import useItemPriceHistory from 'hooks/useItemPriceHistory';
import { OsBuddyItemHistoryEntry } from 'types/OsBuddy';

interface ItemHistoryTableProps {
    id: number | string;
}

function itemRow(entry: OsBuddyItemHistoryEntry): ReactElement {
    return <tr key={entry.ts}>
        <td>{new Date(entry.ts).toLocaleString()}</td>
        <td>{entry.overallPrice}</td>
        <td>{entry.sellingPrice}</td>
        <td>{entry.buyingPrice}</td>
        <td>{entry.buyingQuantity}</td>
        <td>{entry.sellingQuantity}</td>
    </tr>
}

const ItemHistoryTable = function (props: ItemHistoryTableProps): ReactElement {
    const { history } = useItemPriceHistory(props.id, 30);
    history?.sort((a, b) => b.ts - a.ts);

    return (
        <div className="table-container item-history-table">
            <table className="table is-fullwidth is-striped is-hoverable is-sticky">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Overall Price</th>
                        <th>Offer Price</th>
                        <th>Sell Price</th>
                        <th>Buy Quantity</th>
                        <th>Sell Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {history?.map(itemRow)}
                </tbody>
            </table>
        </div>
    );
}

export default ItemHistoryTable;