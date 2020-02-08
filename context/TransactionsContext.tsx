import React from 'react';
import usePersistedState, { StringMapper } from '../hooks/usePersistedState';

const PREFIX = 'transactions-context';
const FAVORITES_KEY = `${PREFIX}-log`;

export class Transaction {
    constructor(public id: string,
        public buy_ts: number,
        public sell_ts: number,
        public itemId: string,
        public quantity: number,
        public buyPrice: number,
        public sellPrice: number) {}

    get profitPerItem(): number {
        return this.sellPrice - this.buyPrice;
    }

    get profit(): number {
        return this.profitPerItem * this.quantity;
    }

    get returnOnInvestment(): number {
        return (this.sellPrice - this.buyPrice) / this.buyPrice * 100;
    }

    static from(itemSummary: Transaction): Transaction {
        return Object.assign(Object.create(Transaction.prototype), itemSummary);
    }
}

interface TransactionContext {
    transactions: Transaction[];
    deleteTransaction: (transaction: Transaction) => void;
    addTransaction: (transaction: Transaction) => void;
}

const context = React.createContext({ 
    transactions: [],
    deleteTransaction: (transaction: Transaction) => {},
    addTransaction: (transaction: Transaction) => {}
} as TransactionContext);

const TransactionListMapper: StringMapper<Transaction[]>= {
    toString(value:Transaction[]): string {
        return JSON.stringify(value);
    },
    fromString(value:string): Transaction[] {
        const objTransactionLog = JSON.parse(value);
        return objTransactionLog?.map(objTransaction => Transaction.from(objTransaction));
    }
};

const provider = (props) => {
    const [transactions, setTransactions] = usePersistedState(FAVORITES_KEY, [], TransactionListMapper);

    const deleteTransaction = (transaction: Transaction) => {
        setTransactions(transactions.filter(t => t.id !== transaction.id));
    }

    const addTransaction = (transaction:Transaction) => {
        const newTransactions = transactions.filter(t => t.id !== transaction.id);
        newTransactions.push(transaction);
        setTransactions(newTransactions);
    }

    return (<context.Provider value={{ transactions, addTransaction, deleteTransaction  }}>
        {props.children}
    </context.Provider>);
}

export {context as TransactionContext, provider as TransactionContextProvider}