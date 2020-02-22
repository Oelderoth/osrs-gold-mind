import React from 'react';
import usePersistedState, { StringMapper } from '../hooks/usePersistedState';
import { Transaction } from '../types/transactions';

const PREFIX = 'transactions-context';
const FAVORITES_KEY = `${PREFIX}-log`;

interface TransactionContext {
    transactions: Transaction<any>[];
    deleteTransaction: (transaction: Transaction<any>) => void;
    addTransaction: (transaction: Transaction<any>) => void;
    addTransactions: (transactions: Transaction<any>[]) => void;
}

const context = React.createContext({ 
    transactions: [],
    deleteTransaction: (transaction: Transaction<any>) => {},
    addTransaction: (transaction: Transaction<any>) => {},
    addTransactions: (transactions: Transaction<any>[]) => {}
} as TransactionContext);

// const TransactionListMapper: StringMapper<Transaction[]>= {
//     toString(value:Transaction[]): string {
//         return JSON.stringify(value);
//     },
//     fromString(value:string): Transaction[] {
//         const objTransactionLog = JSON.parse(value);
//         return objTransactionLog?.map(objTransaction => Transaction.from(objTransaction));
//     }
// };

const provider = (props) => {
    const [transactions, setTransactions] = usePersistedState(FAVORITES_KEY, []);

    const deleteTransaction = (transaction: Transaction<any>) => {
        setTransactions(transactions.filter(t => t.id !== transaction.id));
    }

    const addTransaction = (transaction:Transaction<any>) => {
        const newTransactions = transactions.filter(t => t.id !== transaction.id);
        newTransactions.push(transaction);
        setTransactions(newTransactions);
    }

    const addTransactions = (transactionsToAdd: Transaction<any>[]) => {
        const newIds = transactionsToAdd.map(t => t.id);
        console.log(`Adding ${newIds}`)
        const newTransactions = transactions.filter(t => !newIds.includes(t.id))
            .concat(transactionsToAdd);
        setTransactions(newTransactions);
    }

    return (<context.Provider value={{ transactions, addTransaction, deleteTransaction, addTransactions }}>
        {props.children}
    </context.Provider>);
}

export {context as TransactionContext, provider as TransactionContextProvider}