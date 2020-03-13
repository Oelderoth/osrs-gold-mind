import { RuneliteGrandExchangeTrade } from 'hooks/useRuneliteSession';
import { BasicItemTrade, BasicItemTransaction, Transaction } from 'types/Transactions';

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
        return new BasicItemTrade(buy.time.seconds * 1000, 
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

    return new BasicItemTransaction(trades);
}

/**
 * Returns null if no chunk exists, or an array containing [chunkStartIndex, chunkSize]
 */
const findNextZeroSumTrade = (geHistory: RuneliteGrandExchangeTrade[], startIndex: number = 0, top:boolean = false) : [number, number]|null => {
    if (geHistory.length - startIndex < 2) {
        return null;
    }

    let foundChunk = null;
    let quantity = 0;
    for (let i = startIndex; i < geHistory.length; i++) {
        let trade = geHistory[i];

        if (trade.buy) {
            quantity -= trade.quantity;
        } else {
            quantity += trade.quantity;
        }

        if (quantity === 0) {
            // We've got a match, mark the chunk and break the loop;
            foundChunk = [startIndex, i - startIndex + 1];
            break;
        }
    }

    // Recursively check the rest of the list
    const otherChunk = findNextZeroSumTrade(geHistory, startIndex+1);

    // If we found no chunks, return the other chunk (which may also be null)
    if (!foundChunk) return otherChunk;
    // No other match, return our found chunk if any exists
    if (!otherChunk) return foundChunk;

    // Rturn the one where the latest buy happens before the latest sell
    const foundSlice = geHistory.slice(foundChunk[0], foundChunk[0] + foundChunk[1]);
    const otherSlice = geHistory.slice(otherChunk[0], otherChunk[0] + otherChunk[1])
    const foundLatestSell = foundSlice.filter(t => !t.buy).reduce((acc, cur) => cur.time.seconds > acc ? cur.time.seconds : acc, 0);
    const foundLatestBuy = foundSlice.filter(t => t.buy).reduce((acc, cur) => cur.time.seconds > acc ? cur.time.seconds : acc, 0);
    const otherLatestSell = otherSlice.filter(t => !t.buy).reduce((acc, cur) => cur.time.seconds > acc ? cur.time.seconds : acc, 0);
    const otherLatestBuy = otherSlice.filter(t => t.buy).reduce((acc, cur) => cur.time.seconds > acc ? cur.time.seconds : acc, 0);
    const foundBuyBeforeSell = foundLatestBuy < foundLatestSell;
    const otherBuyBeforeSell = otherLatestBuy < otherLatestSell;
    
    if (otherBuyBeforeSell && !foundBuyBeforeSell) return otherChunk;
    if (foundBuyBeforeSell && !otherBuyBeforeSell) return foundChunk;


    // If all are in-order, return the shorter one
    if (otherChunk[1] < foundChunk[1]) return otherChunk;
    if (foundChunk[1] < otherChunk[1]) return foundChunk;

    // Otherwise return our found chunk because it occurred earlier in the list (ie, later in time)
    return foundChunk;
}

const extractTransactionsForItem = (geHistory:RuneliteGrandExchangeTrade[]):Transaction<BasicItemTrade>[] => {
    /**
     * 1) Sort trades
     * 2) Find the next zero-balance chunk, by the following criteria
     *      2.1) Find the chunk where the latest buy happens before the latest sell
     *      2.2) If all chunks meet that criteria, find the chunk with the fewest number of trades
     *      2.3) If multiple chunks have the same number of trades, take the latest chunk
     * 3) Build the transaction from the chunk
     * 4) Remove the chunk from the history
     * 4) Repeat 2-3 until no chunks remain
     */
    let remainingGeHistory = geHistory.sort((a, b) => b.time.seconds - a.time.seconds);
    let transactions: Transaction<BasicItemTrade>[] = [];
    
    let nextZeroSumTradeSequence = findNextZeroSumTrade(remainingGeHistory, 0, true);
    while (nextZeroSumTradeSequence) {
        const [start, length] = nextZeroSumTradeSequence;
        const chunk = remainingGeHistory.splice(start, length);
        transactions.push(buildTransactionsFromChunk(chunk));
        nextZeroSumTradeSequence = findNextZeroSumTrade(remainingGeHistory, 0, true);
    }

    // Sort the transactions by end time (and then start time) from earliest to latest so that
    // we can collapse price checks accurately
    transactions.sort((a, b) => {
        if (a.endTime == b.endTime) {
            return a.startTime - b.startTime;
        }
        return a.endTime - b.endTime;
    });

    // Collapse price checks into the following transaction
    const collapsableTransactionPredicate = (transaction, i, arr) => {
        const nextTransaction = i+1 < arr.length ? arr[i+1] : null;

        const transactionQuantity = transaction.trades.reduce((acc, cur) => acc + cur.quantity, 0);
        const nextTransactionQuantity = nextTransaction?.trades.reduce((acc, cur) => acc + cur.quantity, 0) ?? 0;

        return (transactionQuantity === 1 && nextTransactionQuantity > 1);
    };

    let nextCollapsablePriceCheckIndex = transactions.findIndex(collapsableTransactionPredicate);
    while (nextCollapsablePriceCheckIndex != -1) {
        
        // Build the collapsed transaction
        const transaction = transactions[nextCollapsablePriceCheckIndex];
        const nextTransaction = transactions[nextCollapsablePriceCheckIndex+1];
        const collapsedTransaction = new BasicItemTransaction([...nextTransaction.trades, ...transaction.trades]);

        // Replace the two collapsed transactions with the new one
        transactions.splice(nextCollapsablePriceCheckIndex, 2, collapsedTransaction);

        nextCollapsablePriceCheckIndex = transactions.findIndex(collapsableTransactionPredicate);
    }

    // Sort the final resulting transactions from most to least recent
    transactions.sort((a, b) => b.endTime - a.endTime);

    return transactions;
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
        matches.push(...extractTransactionsForItem(trades))
    }

    return matches;
}