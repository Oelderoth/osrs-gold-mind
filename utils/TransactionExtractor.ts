import { RuneliteGrandExchangeTrade } from 'hooks/useRuneliteSession';
import { BasicItemTrade, BasicItemTransaction, Transaction } from 'types/Transactions';

const findChunks = (ge:RuneliteGrandExchangeTrade[]): [number, RuneliteGrandExchangeTrade[][]] => {
    if (ge.length < 2) {
        return [0, []];
    }
    
    let quantity = 0;
    // TODO: Allow gaps
    for (let i = 0; i < ge.length; i++) {
        let trade = ge[i];
        if (trade.buy) {
            quantity -= trade.quantity;
            if (quantity === 0) {
                // We've got a match
                const chunk = ge.slice(0, i+1);
                const [rCount, rChunks] = findChunks(ge.slice(i+1));
                return [rCount+1, [chunk, ...rChunks]];
            }
        } else {
            quantity += trade.quantity;
        }
    }

    // If we made it to here, it means we found no chunks, so just cut off the first item
    // And try again

    return findChunks(ge.slice(1));
}

const buildTransactionsFromChunk = (c: RuneliteGrandExchangeTrade[]): Transaction<BasicItemTrade> => {
    // Find the first unfulfilled buy
    // Iterate through the unfulfilled sells with a timestamp later than the buy, filling them as possible
    // If all sells are fulfilled but the buy is not fulfilled, add the buy to the "remainder" bucket
    // Once all buys are either fulfilled or marked as a "remainder", fulfill them from the remaining sells, ignoring timestamps

    let chunk = [...c];
    const trades:BasicItemTrade[] = [];

    let buys = chunk.filter(t => t.buy);
    let sells = chunk.filter(t => !t.buy);

    const createBasicItemTrade = (buy: RuneliteGrandExchangeTrade, sell: RuneliteGrandExchangeTrade, quantity): BasicItemTrade => {
        return new BasicItemTrade(`${buy.itemId}:${quantity}:${buy.time.seconds}:${sell.time.seconds}`,
            buy.time.seconds * 1000, 
            sell.time.seconds * 1000, 
            buy.itemId.toString(), 
            quantity, 
            buy.price, 
            sell.price)
    }

    const anomalousBuys=[];

    while (buys.length > 0) {
        const buy = buys[0];
        const sellsAfterBuy = sells.filter(s => s.time.seconds > buy.time.seconds);
        while (buy.quantity > 0) {
            // Grab the earliest remaining sell
            const sell = sellsAfterBuy.shift();
            if (!sell) {
                // If there are no sells after this buy, remove it and handle it later
                buys = buys.filter(b => b !== buy)
                anomalousBuys.push(buy);
                break;
            }

            const quantity = Math.min(buy.quantity, sell.quantity);
            buy.quantity -= quantity;
            sell.quantity -= quantity;
            trades.push(createBasicItemTrade(buy, sell, quantity))

            // If the sell was fulfilled, remove from the list
            if (sell.quantity === 0) {
                sells = sells.filter(s => s !== sell)
            }
            // If the buy was fulfilled, remove from the list
            if (buy.quantity === 0) {
                buys = buys.filter(b => b !== buy)
            }
        }
    }

    // For any buys unable to be matched with sells that occured _after_ them,
    // Fill them from any remaining sell that's available
    while (anomalousBuys.length > 0 && sells.length > 0) {
        const buy = anomalousBuys.shift();
        while (buy.quantity > 0) {
            // Grab the earliest remaining sell
            const sell = sells[0];

            const quantity = Math.min(buy.quantity, sell.quantity);
            buy.quantity -= quantity;
            sell.quantity -= quantity;
            trades.push(createBasicItemTrade(buy, sell, quantity))

            // If the sell was fulfilled, remove from the list
            if (sell.quantity === 0) {
                sells = sells.filter(s => s !== sell)
            }
            // If the buy was fulfilled, remove from the list
            if (buy.quantity === 0) {
                buys = buys.filter(b => b !== buy)
            }
        }
    }

    const itemId = trades[0].itemId;
    const earliestTime = trades.reduce((acc, cur) => Math.min(acc, cur.startTime), trades[0].startTime);
    const latestTime = trades.reduce((acc, cur) => Math.max(acc, cur.endTime), trades[0].endTime);

    return new BasicItemTransaction(`${itemId}:${earliestTime}:${latestTime}`,trades);
}

const extractTransactionsForItem = (geHistory:RuneliteGrandExchangeTrade[]):Transaction<BasicItemTrade>[] => {
    let processedGe = geHistory.sort((a, b) => b.time.seconds - a.time.seconds);
    
    console.log(`\tFinding Chunks`)
    const [_, chunks] = findChunks(processedGe);
    console.log(`\tFound ${chunks.length} chunks`, chunks)
    console.log(`\tFinding Transactions`)
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

export default function extractTransactions(geHistory: RuneliteGrandExchangeTrade[]): Transaction<BasicItemTrade>[] {
    // Map<[itemId, price], trades[]>
    const groupedTrades:  Map<number, RuneliteGrandExchangeTrade[]> = new Map();
        
    // Group trades by itemId
    for (let trade of geHistory) {
        if (groupedTrades.has(trade.itemId)) {
            groupedTrades.get(trade.itemId).push(trade);
        } else {
            groupedTrades.set(trade.itemId, [trade]);
        }
    }

    const matches = [];
    for (let [key, trades] of groupedTrades) {
        console.log(`Finding matches for ${trades.length} trades of ${key}`)
        matches.push(...extractTransactionsForItem(trades))
    }

    return matches;
}