export enum TransactionType {
    BASIC_ITEM_TRADE
}

export interface Trade {
    readonly id: string;
    readonly profit: number;
    readonly startTime: number;
    readonly endTime: number;
    readonly buyPrice: number;
    readonly sellPrice: number;
}

/**
 * A trade where a single item was bought for a price and then later sold for a different price
 */
export class BasicItemTrade implements Trade {
    public readonly startTime: number;
    public readonly endTime: number;
    public readonly profit: number;
    public readonly profitPerItem: number;
    public readonly ROI: number;
    public readonly buyPrice: number;
    public readonly sellPrice: number;

    constructor(public id: string,
        buy_ts: number,
        sell_ts: number,
        public itemId: string,
        public quantity: number,
        buyPrice: number,
        sellPrice: number) {
            this.startTime = buy_ts;
            this.endTime = sell_ts;
            this.profitPerItem = sellPrice - buyPrice;
            this.profit = this.profitPerItem * quantity;
            this.ROI = (sellPrice - buyPrice) / buyPrice * 100;
            this.buyPrice = buyPrice * quantity;
            this.sellPrice = sellPrice * quantity;
        }

    static from(itemSummary: BasicItemTrade): BasicItemTrade {
        return Object.assign(Object.create(BasicItemTrade.prototype), itemSummary);
    }
}

export interface Transaction<T extends Trade> {
    readonly id: string;
    readonly trades: T[];
    readonly startTime: number;
    readonly endTime: number;
    readonly profit: number;
    readonly buyPrice: number;
    readonly sellPrice: number;
    readonly ROI: number;
    readonly transactionType: TransactionType;    
    readonly name?: string;
    readonly quantity?: number;
}

/**
 * Represents a Trade or a group of Trades that were done as a cohesive unit
 */
export class BasicItemTransaction implements Transaction<BasicItemTrade> {
    public readonly startTime: number;
    public readonly endTime: number;
    public readonly profit: number;
    public readonly buyPrice: number;
    public readonly sellPrice: number;
    public readonly ROI: number;
    public readonly transactionType: TransactionType = TransactionType.BASIC_ITEM_TRADE;

    constructor(public id: string,
        public readonly trades: BasicItemTrade[]) {
        this.startTime = trades.reduce((acc, cur) => Math.min(acc, cur.startTime), Number.MAX_VALUE);
        this.endTime = trades.reduce((acc, cur) => Math.max(acc, cur.endTime), Number.MIN_VALUE);
        this.profit = trades.reduce((acc, cur) => acc + cur.profit, 0);
        this.buyPrice = trades.reduce((acc, cur) => acc + cur.buyPrice, 0);
        this.sellPrice = trades.reduce((acc, cur) => acc + cur.sellPrice, 0);
        this.ROI = (this.sellPrice - this.buyPrice) / this.buyPrice * 100;
    };

    static from(itemSummary: BasicItemTransaction): BasicItemTransaction {
        return Object.assign(Object.create(BasicItemTransaction.prototype), itemSummary);
    }
}