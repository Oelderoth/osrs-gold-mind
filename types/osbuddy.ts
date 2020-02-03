export interface IRawOsBuddySummaryResponse {
    [key: string]: OsBuddyItemSummary
}

export class OsBuddyPriceSummary {
    constructor(private data: IRawOsBuddySummaryResponse) { }
    getItem(id: string|number): OsBuddyItemSummary {
        return this.data[id];
    }

    getItems(): OsBuddyItemSummary[] {
        return Object.getOwnPropertyNames(this.data).map(id => this.data[id]);
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

    static from(itemSummary: OsBuddyItemSummary): OsBuddyItemSummary {
        return Object.assign(Object.create(OsBuddyItemSummary.prototype), itemSummary);
    }
}