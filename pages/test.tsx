import ge from '../public/ge.json';
import useRunelite, { RuneliteSessionStatus, RuneliteGrandExchangeTrade, useRuneliteGeHistory } from '../hooks/useRuneliteSession';
import {Transaction, BasicItemTrade, BasicItemTransaction} from '../types/transactions';
import NewTransactionModal from '../components/newTransactionModal.jsx';
import TransactionGrid from '../components/transactionGrid';

const findChunks = (ge:RuneliteGrandExchangeTrade[]): [number, RuneliteGrandExchangeTrade[][]] => {
    if (ge.length < 2) {
        return [0, []];
    }
    
    let quantity = 0;
    let start = 0;
    const chunks = [];
    // TODO: Allow gaps
    for (let i = start; i < ge.length; i++) {
        let trade = ge[i];
        if (trade.buy) {
            quantity -= trade.quantity;
            if (quantity === 0) {
                chunks.push(ge.slice(start, i+1))
                start = i+1
                continue;
                // We've got a match
            }
        } else {
            quantity += trade.quantity;
        }
    }

    const [rCount, rChunks] = findChunks(ge.slice(1));
    if (rCount > chunks.length) {
        return [rCount, rChunks]
    } else {
        return [chunks.length, chunks]
    }
}

const buildTransactionsFromChunk = (c: RuneliteGrandExchangeTrade[]): Transaction<BasicItemTrade> => {
    let chunk = [...c];
    const trades:BasicItemTrade[] = [];
    console.log(`\t\tChecking Chunk`, chunk)
    let allTransactionsFound = false;
    while (!allTransactionsFound) {
        // Find the first buy we haven't filled
        const firstUnfulfilledBuyIndex = chunk.findIndex(trade => trade.buy);
        if (firstUnfulfilledBuyIndex < 0) {
            allTransactionsFound = true;
            break;
        }
        const buy = chunk[firstUnfulfilledBuyIndex];
        console.log(`\t\tFound unfulfilled buy of ${buy.quantity}`)
        // Then iterate backwards from that buy through all sells, filling the buy as you go, until it is fully filled
        for (let i = firstUnfulfilledBuyIndex-1; i >= 0; i--) {
            const sell = chunk[i];
            if (sell.buy) continue;
            console.log(`\t\tChecking sell of ${sell.quantity}`)
            if (sell.quantity === buy.quantity) { // Sell exactly fills buy
                // Create a transaction
                const trade = new BasicItemTrade(`${buy.itemId}:${buy.time.seconds}:${sell.time.seconds}`, buy.time.seconds*1000, sell.time.seconds*1000, buy.itemId.toString(), buy.quantity, buy.price, sell.price);
                trades.push(trade)
                // Remove the sell and buy from the list, they're both filled
                chunk = chunk.filter(t => !(t === sell || t === buy));
                break;
            } else if (sell.quantity < buy.quantity) { // Sell partially fills buy
                // Create a transaction
                const trade = new BasicItemTrade(`${buy.itemId}:${buy.time.seconds}:${sell.time.seconds}`, buy.time.seconds*1000, sell.time.seconds*1000, buy.itemId.toString(), sell.quantity, buy.price, sell.price);
                trades.push(trade)
                // Remove the sell from the list since it's filled
                chunk = chunk.filter(t => !(t === sell));
                buy.quantity -= sell.quantity;
            } else { // Sell completely fills buy, but has excess
                // Create a transaction
                const trade = new BasicItemTrade(`${buy.itemId}:${buy.time.seconds}:${sell.time.seconds}`, buy.time.seconds*1000, sell.time.seconds*1000, buy.itemId.toString(), buy.quantity, buy.price, sell.price);
                trades.push(trade)
                // Remove the buy from the list since it's filled
                chunk = chunk.filter(t => !(t === buy));
                sell.quantity -= buy.quantity;
                break;
            }
        }
    }

    return new BasicItemTransaction(trades[0].id,trades);
}

const findMatches = (ge:RuneliteGrandExchangeTrade[]):Transaction<BasicItemTrade>[] => {
    let processedGe = ge.sort((a, b) => b.time.seconds - a.time.seconds);
    // // Trim buys from the front of the list, these obviously haven't been sold yet
    // while (processedGe.length > 0 && processedGe[0].buy) {
    //     processedGe.shift()
    // }
    // // Trim sells from the end of the list, their buys are no longer available
    // while (processedGe.length > 0 && !processedGe[processedGe.length-1].buy) {
    //     processedGe.pop();
    // }

    /**
     * Bought 1x at 18999
Sold 1x at 18500
--
Bought 1x at 18504
Sold 295x at 18995
Bought 1000x at 18501
Sold 489x at 18995
Sold 217x at 18995
--
Bought 1x at 18999
Sold 1x at 18525
--
Bought 2000x at 18526
Bought 1x at 18998
Sold 2001x at 18997
--
Bought 1x at 18999
Sold 1x at 18652
--
Bought 1000x at 18652
Bought 1x at 18995
Sold 1x at 18621
Sold 1000x at 18994
--
Bought 1x at 18737
Sold 1x at 18621
--
Bought 1x at 18500
Sold 1x at 18004
--
Bought 1286x at 18005
Bought 1x at 18675
Sold 1x at 18100
Bought 749x at 18101
Sold 280x at 18674
Bought 1x at 18400
Bought 1x at 18180
Sold 1279x at 18674
Sold 478x at 18171
--
Bought 1x at 18140
Sold 1x at 18000
--
Bought 1x at 17212
Sold 1x at 17201


     */

    console.log(`\tFinding Chunks`)
    const [_, chunks] = findChunks(processedGe);
    console.log(`\tFound ${chunks.length} chunks`, chunks)
    console.log(`\tFinding Transactions`)
    return [];
    const transactions = chunks.map(buildTransactionsFromChunk)
    console.log(`\tFound ${transactions.length} transactions. Collapsing rogue price checks`)

    // Collapse price checks into the following transaction
    const collapsedTransactions = [];
    for (let i = transactions.length-1; i >=0 ; i--) {
        const transaction = transactions[i];
        // If it is a single transaction of a single item
        if (i > 0 && transaction.trades.length === 1 && transaction.trades[0].quantity === 1) {
            collapsedTransactions.push(new BasicItemTransaction(transactions[i-1].id, [...transactions[i-1].trades, ...transaction.trades]))
            i--;
        } else {
            collapsedTransactions.push(transaction);
        }
    }
    console.log(`\tCollapsed into ${collapsedTransactions.length} transactions`)

    return collapsedTransactions;
}

export default (props) => {
    // const { session, login } = useRunelite();
    // (async () => {
    //     if (session.status === RuneliteSessionStatus.LOGGED_OUT) {
    //         await login();
    //     }
    // })();
    // const geHistory = useRuneliteGeHistory(session);
    // // Map<[itemId, price], trades[]>
    // const groupedTrades:  Map<number, RuneliteGrandExchangeTrade[]> = new Map();
        
    // // Group trades by itemId
    // for (let trade of geHistory) {
    //     if (groupedTrades.has(trade.itemId)) {
    //         groupedTrades.get(trade.itemId).push(trade);
    //     } else {
    //         groupedTrades.set(trade.itemId, [trade]);
    //     }
    // }

    // const matches = []
    // for (let [key, trades] of groupedTrades) {
    //     console.log(`Finding matches for ${trades.length} trades of ${key}`)
    //     matches.push(findMatches(trades))
    // }

    const matches = findMatches(ge);
    return (<div className="section content">
        <TransactionGrid transactions={matches} onDeleteTransaction={() => {}}/>
    </div>);
}