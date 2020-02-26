import React, { Fragment, useContext, useState } from 'react';

import { NextPage } from 'next';

import classNames from 'classnames';

import NewTransactionModal from 'components/NewTransactionModal';
import RuneliteImportModal from 'components/RuneliteImportModal';
import TransactionGrid from 'components/TransactionGrid';
import { TransactionContext } from 'context/TransactionsContext';
import useRunelite, { RuneliteSessionStatus } from 'hooks/useRuneliteSession';

const Transactions: NextPage = function () {
    const { transactions, addTransaction, addTransactions, deleteTransaction } = useContext(TransactionContext);
    const [newTransactionModalVisible, setNewTransactionModalVisible] = useState(false);
    const [runeliteModalVisible, setRuneliteModalVisible] = useState(false);
    const { session, login } = useRunelite();

    const totalProfit = transactions.reduce((acc, cur) => acc + cur.profit, 0);

    return (
        <Fragment>
            <div className="section">
                <div className="is-flex is-space-between is-align-center">
                    <div>
                        <h1 className="title">Transactions</h1>
                        <h2 className="subtitle">Transaction History</h2>
                    </div>
                    <div className='profit-summary has-text-centered'>
                        <h1 className={classNames("title",{
                            'has-text-primary': totalProfit >= 0,
                            'has-text-danger': totalProfit < 0
                        })}>{totalProfit >= 0 ? '+' : null}{totalProfit.toLocaleString()}</h1>
                        <h2 className="subtitle">{transactions.length} Transactions</h2>
                    </div>
                    <div className="buttons">
                        <button className={classNames("button is-outlined", {
                            'is-primary': session?.status !== RuneliteSessionStatus.ERROR,
                            'is-danger': session?.status === RuneliteSessionStatus.ERROR,
                            'is-loading': session?.status === RuneliteSessionStatus.LOGGING_IN,
                        })} onClick={async () => {
                            const session = await login();
                            if (session?.status === RuneliteSessionStatus.LOGGED_IN) {
                                setRuneliteModalVisible(true);
                            }
                        }}>{session?.status === RuneliteSessionStatus.ERROR ? "Unable to connect to RuneLite" : "Import From RuneLite"}</button>
                        <a className="button is-primary is-outlined" onClick={() => setNewTransactionModalVisible(true)}>Add Transaction</a>
                    </div>
                </div>
                <TransactionGrid transactions={transactions} onDeleteTransaction={
                    (transaction) => {
                        deleteTransaction(transaction);
                    }
                } />
            </div>

            <NewTransactionModal visible={newTransactionModalVisible} 
                onCancel={() => setNewTransactionModalVisible(false)}
                onTransactionCreate={transaction => {
                    addTransaction(transaction);
                    setNewTransactionModalVisible(false);
                }}/>

            <RuneliteImportModal visible={runeliteModalVisible} 
            session={session}
            transactions={transactions}
            onCancel={() => setRuneliteModalVisible(false)}
            onTransactionsImport={(transactionsToImport) => {
                addTransactions(transactionsToImport);
                setRuneliteModalVisible(false);
            }}/>
        </Fragment>
    );
}

export default Transactions;