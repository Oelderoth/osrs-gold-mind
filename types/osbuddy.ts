export interface IRawOsBuddySummaryResponse {
    [key: string]: OsBuddyItemSummary
}

export class OsBuddyPriceSummary {
    constructor(private data: IRawOsBuddySummaryResponse) { }
    getItem(id: string | number): OsBuddyItemSummary {
        return id ? OsBuddyItemSummary.from(this.data[id]) : null;
    }

    getItems(): OsBuddyItemSummary[] {
        return Object.getOwnPropertyNames(this.data).map(id => OsBuddyItemSummary.from(this.data[id]));
    }
}

export class OsBuddyItemSummary {
    constructor(public id: number,
        public name: string,
        public members: boolean,
        public sp: number,
        public buy_average: number,
        public buy_quantity: number,
        public sell_average: number,
        public sell_quantity: number,
        public overall_average: number,
        public overall_quantity: number) { }

    get isBuyUpToDate(): boolean {
        return this.buy_average > 0;
    }

    get isSellUpToDate(): boolean {
        return this.sell_average > 0;
    }

    get isUpToDate(): boolean {
        return this.isBuyUpToDate && this.isSellUpToDate;
    }

    get profit(): number {
        return this.isUpToDate ? this.buy_average - this.sell_average : 0;
    }

    get returnOnInvestment(): number {
        return (this.profit / this.sell_average) * 100;
    }

    get buySellRatio(): number {
        return (this.sell_quantity / this.buy_quantity);
    }

    static from(itemSummary: OsBuddyItemSummary): OsBuddyItemSummary {
        return Object.assign(Object.create(OsBuddyItemSummary.prototype), itemSummary);
    }
}

export interface OsBuddyItemHistoryEntry {
    ts: number;
    overallPrice: number;
    overallQuantity: number;
    buyingPrice: number;
    buyingQuantity: number;
    sellingPrice: number;
    sellingQuantity: number;
}