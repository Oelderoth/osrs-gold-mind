import TransactionExtractor from '../utils/TransactionExtractor';
import { RuneliteGrandExchangeTrade } from '../hooks/useRuneliteSession';

const TEST_ITEM = 0;

// Create a variable that increments with each created trade, so that their timestamps will be in the order they were created (ie, last created trade is the most recent)
let tradeTime = 0;

beforeEach(() => {
    tradeTime = 0;
})

describe('TransactionExtractor', () => {
    it('should extract a single matching buy/sell as a transaction', () => {
        const geHistory = [
            createBuy(TEST_ITEM, 1, 100),
            createSell(TEST_ITEM, 1, 200)
        ];

        const transactions = TransactionExtractor(geHistory);
        transactions.sort((a, b) => a.startTime - b.startTime);

        expect(transactions.length).toBe(1);

        const transaction = transactions[0];
        expect(transaction.startTime).toBe(0);
        expect(transaction.endTime).toBe(1000);
        expect(transaction.buyPrice).toBe(100);
        expect(transaction.sellPrice).toBe(200);
        expect(transaction.trades[0].quantity).toBe(1);
    })

    it('should extract two sets of matching buy/sell as two separate transactions', () => {
        const geHistory = [
            createBuy(TEST_ITEM, 5, 100),
            createSell(TEST_ITEM, 5, 200),
            createBuy(TEST_ITEM, 5, 200),
            createSell(TEST_ITEM, 5, 300)
        ];

        const transactions = TransactionExtractor(geHistory);
        transactions.sort((a, b) => a.startTime - b.startTime);

        expect(transactions.length).toBe(2);

        expect(transactions[0].startTime).toBe(0);
        expect(transactions[0].endTime).toBe(1000);
        expect(transactions[0].buyPrice).toBe(5*100);
        expect(transactions[0].sellPrice).toBe(5*200);
        expect(transactions[0].trades[0].quantity).toBe(5);

        expect(transactions[1].startTime).toBe(2000);
        expect(transactions[1].endTime).toBe(3000);
        expect(transactions[1].buyPrice).toBe(5*200);
        expect(transactions[1].sellPrice).toBe(5*300);
        expect(transactions[1].trades[0].quantity).toBe(5);
    })

    it('should collapse a price checks into the following transaction', () => {
        const TRADE_QUANTITY = 20;
        const PRICE_CHECK_QUANTITY = 1;

        const geHistory = [
            createBuy(TEST_ITEM, TRADE_QUANTITY, 100), // Early Trade
            createSell(TEST_ITEM, TRADE_QUANTITY, 200),
            createBuy(TEST_ITEM, PRICE_CHECK_QUANTITY, 10), // Price Check
            createSell(TEST_ITEM, PRICE_CHECK_QUANTITY, 20),
            createBuy(TEST_ITEM, TRADE_QUANTITY, 11), // Subsequent Trade
            createSell(TEST_ITEM, TRADE_QUANTITY, 19),
        ];

        const transactions = TransactionExtractor(geHistory);
        transactions.sort((a, b) => a.startTime - b.startTime);

        expect(transactions.length).toBe(2);

        expect(transactions[0].startTime).toBe(0);
        expect(transactions[0].endTime).toBe(1000);
        expect(transactions[0].buyPrice).toBe(20 * 100);
        expect(transactions[0].sellPrice).toBe(20 * 200);
        expect(transactions[0].trades[0].quantity).toBe(20)

        expect(transactions[1].startTime).toBe(2000);
        expect(transactions[1].endTime).toBe(5000);
        expect(transactions[1].buyPrice).toBe(10 + 20*11);
        expect(transactions[1].sellPrice).toBe(20 + 20*19);
        expect(transactions[1].trades[0].quantity).toBe(20)
        expect(transactions[1].trades[1].quantity).toBe(1)
    })

    it('should extract a multi-part buy/sell order into a single transaction', () => {
        const geHistory = [
            // Initial price check
            createBuy(TEST_ITEM, 1, 200),
            createSell(TEST_ITEM, 1, 100),
            // Place an order for 10k, cancel after 1k
            createBuy(TEST_ITEM, 1000, 101),
            // Second Price Check
            createBuy(TEST_ITEM, 1, 180),
            createSell(TEST_ITEM, 1, 104),
            // Place a second buy order for 4k
            createBuy(TEST_ITEM, 4000, 105),
            // Final price check
            createBuy(TEST_ITEM, 1, 201),
            // Sell final price check and accumulated 5k items
            createSell(TEST_ITEM, 5001, 200)
        ];
        const totalBuyPrice = geHistory.filter(t => t.buy).reduce((acc, cur) => acc + cur.quantity * cur.price, 0);
        const totalSellPrice = geHistory.filter(t => !t.buy).reduce((acc, cur) => acc + cur.quantity * cur.price, 0);

        const transactions = TransactionExtractor(geHistory);
        transactions.sort((a, b) => a.startTime - b.startTime);

        expect(transactions.length).toBe(1);

        const transaction = transactions[0];
        expect(transaction.startTime).toBe(0);
        expect(transaction.endTime).toBe(7000);
        expect(transaction.buyPrice).toBe(totalBuyPrice);
        expect(transaction.sellPrice).toBe(totalSellPrice);
    })

    it('should extract different items into different transactions', () => {
        const OTHER_ITEM = 1;
        const geHistory = [
            createBuy(TEST_ITEM, 1, 200),
            createBuy(OTHER_ITEM, 5, 100),
            createSell(TEST_ITEM, 1, 100),
            createSell(OTHER_ITEM, 1, 200),
            createSell(OTHER_ITEM, 4, 190)
        ]

        const transactions = TransactionExtractor(geHistory);
        transactions.sort((a, b) => a.startTime - b.startTime);

        expect(transactions.length).toBe(2);

        expect(transactions[0].startTime).toBe(0);
        expect(transactions[0].endTime).toBe(2000);
        expect(transactions[0].buyPrice).toBe(200);
        expect(transactions[0].sellPrice).toBe(100);
        expect(transactions[0].trades[0].itemId).toBe(TEST_ITEM.toString());

        expect(transactions[1].startTime).toBe(1000);
        expect(transactions[1].endTime).toBe(4000);
        expect(transactions[1].buyPrice).toBe(5 * 100);
        expect(transactions[1].sellPrice).toBe(200 + 4*190);
        expect(transactions[1].trades[0].itemId).toBe(OTHER_ITEM.toString());
    })

    it('should handle cases where the buys and sells are out of order due to partial buys', () => {
        const geHistory = [
            // Price Check
            createBuy(TEST_ITEM, 1, 99),
            createSell(TEST_ITEM, 1, 201),
            // The buy was placed and 500 were filled, then put up for sale
            // They finished selling before the next 500 bought
            createSell(TEST_ITEM, 500, 200),
            createBuy(TEST_ITEM, 1000, 100),
            // Price check before dumping
            createBuy(TEST_ITEM, 1, 201),
            createSell(TEST_ITEM, 501, 200)
        ];
        const totalBuyPrice = geHistory.filter(t => t.buy).reduce((acc, cur) => acc + cur.quantity * cur.price, 0);
        const totalSellPrice = geHistory.filter(t => !t.buy).reduce((acc, cur) => acc + cur.quantity * cur.price, 0);
        
        const transactions = TransactionExtractor(geHistory);
        transactions.sort((a, b) => a.startTime - b.startTime);

        expect(transactions.length).toBe(1);

        const transaction = transactions[0];
        expect(transaction.startTime).toBe(0);
        expect(transaction.endTime).toBe(5000);
        expect(transaction.buyPrice).toBe(totalBuyPrice);
        expect(transaction.sellPrice).toBe(totalSellPrice);
    })

    it('should extract a short transaction in the middle of a long one into two transactions', () => {
        const geHistory = [
            // Run a price check
            createBuy(TEST_ITEM, 1, 200),
            createSell(TEST_ITEM, 1, 99),
            // Buy a large quantity of items that will take a long time to sell off
            createBuy(TEST_ITEM, 10000, 100),
            // Now we waited a few days without selling, and run another price check
            createBuy(TEST_ITEM, 1, 90),
            createSell(TEST_ITEM, 1, 70),
            // Prices were too low to sell of the large stockpile, but good enough for a short-term transaction
            createBuy(TEST_ITEM, 1000, 71),
            // Now do intermittent price check to find sell price
            createBuy(TEST_ITEM, 1, 101),
            // Sell off all of the short transaction and the price check
            createSell(TEST_ITEM, 1001, 100),
            // Now we wait and run another price check
            createBuy(TEST_ITEM, 1, 180),
            // Prices are good so dump the entire stock
            createSell(TEST_ITEM, 10001, 179)
        ];

        const transactions = TransactionExtractor(geHistory);
        transactions.sort((a, b) => a.startTime - b.startTime);

        expect(transactions.length).toBe(2);

        // First transaction is the long one since we sort by start time
        expect(transactions[0].startTime).toBe(0);
        expect(transactions[0].endTime).toBe(9000);
        expect(transactions[0].buyPrice).toBe(200 + 10000*100 + 180);
        expect(transactions[0].sellPrice).toBe(99 + 10001*179);
        expect(transactions[0].trades.reduce((acc, cur) => acc + cur.quantity, 0)).toBe(10002);

        expect(transactions[1].startTime).toBe(2000);
        expect(transactions[1].endTime).toBe(7000);
        expect(transactions[1].buyPrice).toBe(200 + 10000*100 + 180);
        expect(transactions[1].sellPrice).toBe(99 + 10001*179);
        expect(transactions[1].trades.reduce((acc, cur) => acc + cur.quantity, 0)).toBe(10002);
    });
})

const createBuy = (itemId: number, quantity: number, price: number): RuneliteGrandExchangeTrade => createTrade(true, itemId, quantity, price);
const createSell = (itemId: number, quantity: number, price: number): RuneliteGrandExchangeTrade => createTrade(false, itemId, quantity, price);

const createTrade = (buy:boolean, itemId: number, quantity: number, price: number): RuneliteGrandExchangeTrade => ({
    buy,
    quantity,
    price,
    itemId,
    time: {
        seconds: tradeTime++,
        nanos: 0
    }
})