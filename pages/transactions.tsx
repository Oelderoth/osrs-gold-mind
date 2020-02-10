import React, { useContext, Fragment, useState, useEffect } from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../types/osbuddy';
import { highVolumeFilter as filter } from '../filters';
import classNames from 'classnames';

import '../styles.scss';
import TransactionGrid from '../components/transactionGrid';
import { TransactionContext } from '../context/TransactionsContext';
import NewTransactionModal from '../components/newTransactionModal';
import useRunelite, { RuneliteSessionStatus } from '../hooks/useRuneliteSession';
import RuneliteImportModal from '../components/runeliteImportModal';

const Transactions: NextPage = function () {
    const { transactions, addTransaction, deleteTransaction } = useContext(TransactionContext);
    const [newTransactionModalVisible, setNewTransactionModalVisible] = useState(false);
    const [runeliteModalVisible, setRuneliteModalVisible] = useState(false);
    const { session, login } = useRunelite();
    return (
        <Fragment>
            <div className="section">
                <div className="is-flex is-space-between is-align-center">
                    <div>
                        <h1 className="title">Transactions</h1>
                        <h2 className="subtitle">Transaction History</h2>
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

            {// Only create a transaction modal when visible, so that fields are cleared after closing
            newTransactionModalVisible && <NewTransactionModal visible={newTransactionModalVisible} 
            onCancel={() => setNewTransactionModalVisible(false)}
            onTransactionCreate={transaction => {
                addTransaction(transaction);
                setNewTransactionModalVisible(false);
            }}/>}

            {// Only create a transaction modal when visible, so that fields are cleared after closing
            runeliteModalVisible && <RuneliteImportModal visible={runeliteModalVisible} 
            session={session}
            onCancel={() => setRuneliteModalVisible(false)}/>}
        </Fragment>
    );
}

export default Transactions;