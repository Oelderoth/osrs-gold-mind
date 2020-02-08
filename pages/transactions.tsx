import React, { useContext, Fragment, useState } from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../types/osbuddy';
import { highVolumeFilter as filter } from '../filters';

import '../styles.scss';
import TransactionGrid from '../components/transactionGrid';
import { TransactionContext } from '../context/TransactionsContext';
import NewTransactionModal from '../components/newTransactionModal';

const Transactions: NextPage = function () {
    const { transactions, addTransaction, deleteTransaction } = useContext(TransactionContext);
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <Fragment>
            <div className="section">
                <div className="is-flex is-space-between is-align-center">
                    <div>
                        <h1 className="title">Transactions</h1>
                        <h2 className="subtitle">Transaction History</h2>
                    </div>
                    <div>
                        <a className="button is-primary" onClick={() => setModalVisible(true)}>Add Transaction</a>
                    </div>
                </div>
                <TransactionGrid transactions={transactions} onDeleteTransaction={
                    (transaction) => {
                        deleteTransaction(transaction);
                    }
                } />
            </div>

            {
                // Only create a transaction modal when visible, so that fields are cleared after closing
                modalVisible && <NewTransactionModal visible={modalVisible} 
                onCancel={() => setModalVisible(false)}
                onTransactionCreate={transaction => {
                    addTransaction(transaction);
                    setModalVisible(false);
                }}/>}
        </Fragment>
    );
}

export default Transactions;