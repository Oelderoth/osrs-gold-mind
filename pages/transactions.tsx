import React, { useContext } from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../types/osbuddy';
import { highVolumeFilter as filter } from '../filters';

import '../styles.scss';
import TransactionGrid from '../components/transactionGrid';
import { TransactionContext } from '../context/TransactionsContext';
import TypeaheadInput from '../components/typeaheadInput';

const Transactions: NextPage = function () {
    const { transactions } = useContext(TransactionContext);
    const { summary } = usePriceSummary();
    const itemNames = summary?.getItems().map(item => item.name) ?? [];

    return (
        <div className="section">
            <div className="is-flex is-space-between is-align-center">
                <div>
                    <h1 className="title">Transactions</h1>
                    <h2 className="subtitle">Transaction History</h2>
                </div>
                <div>
                    <a className="button">Add Transaction</a>
                </div>
            </div>

            <div className="modal is-active">
                <div className="modal-background"></div>
                <div className="modal-content is-overflow-visible">
                    <div className="panel">
                        <p className = "panel-heading">Add New Transaction</p>
                        <div className="pdivnel-block">
                            <div className="control has-icons-left">
                                <span className="icon is-small is-left">
                                    <i className="fas fa-search" />
                                </span>
                                <TypeaheadInput className="input" type="text" placeholder="Search for item..." suggestions={itemNames} onSuggestionSelect={
                                    (suggestion: string, setValue) => {
                                        setValue(suggestion);
                                    }
                                }/>
                            </div>
                        </div>
                        <div className="panel-block is-flex is-space-between">
                            <div className="field is-marginless">
                                <label className="label is-small">Buy Price</label>
                                <input className="input is-small" type="number" min="0" defaultValue={0}/>
                            </div>
                            <div className="field is-marginless">
                                <label className="label is-small">Sell Price</label>
                                <input className="input is-small" type="number" min="0" defaultValue={0}/>
                            </div>
                            <div className="field is-marginless">
                                <label className="label is-small">Quantity</label>
                                <input className="input is-small" type="number" min="0" defaultValue={0}/>
                            </div>
                        </div>
                        <div className="panel-block is-flex is-flex-end buttons">
                            <a className="button is-small is-primary">Create Transaction</a>
                            <a className="button is-small">Cancel</a>
                        </div>
                    </div>
                </div>
                <button className="modal-close is-large" aria-label="close"></button>
            </div>

            <TransactionGrid transactions={transactions} />
        </div>
    );
}

export default Transactions;