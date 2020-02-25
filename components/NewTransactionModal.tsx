import React, { ReactElement, useEffect, useRef, useState, RefObject } from 'react';

import classNames from 'classnames';

import TypeaheadInput, { TypeaheadInputElement } from 'components/TypeaheadInput';
import usePriceSummary from 'hooks/usePriceSummary';
import { BasicItemTrade, BasicItemTransaction, Transaction } from 'types/Transactions';

interface NewTransactionModal {
    visible: boolean;
    onTransactionCreate: (transaction: Transaction<any>) => void;
    onCancel: () => void;
}

const createTransaction = (itemId: string, buyPrice: number, sellPrice: number, quantity: number): Transaction<BasicItemTrade> => {
    const timestamp = Date.now();
    const id = `${itemId}:${quantity}:${timestamp.toString()}:${timestamp.toString()}`;
    const trade = new BasicItemTrade(id, timestamp, timestamp, itemId, quantity, buyPrice, sellPrice);
    return new BasicItemTransaction(id, [trade]);
}

const NewTransactionModal = (props: NewTransactionModal): ReactElement => {
    const [isValid, setValid] = useState(false);
    
    const [itemId, setItemId] = useState();
    const [buyPrice, setBuyPrice] = useState();
    const [sellPrice, setSellPrice] = useState();
    const [quantity, setQuantity] = useState();

    const { summary } = usePriceSummary();
    const itemNames = summary?.getItems().map(item => item.name) ?? [];

    const validate = () => {
        const valid = itemId && buyPrice > 0 && sellPrice > 0 && quantity > 0
        if (valid != isValid)
            setValid(valid);
    };

    useEffect(() => validate(), [itemId, buyPrice, sellPrice, quantity, summary]);

    // If the visibility changes to false, clear all inputs
    useEffect(() => {
        if (!props.visible) {
            searchRef.current.value = '';
            buyPriceRef.current.value = '0';
            sellPriceRef.current.value = '0';
            quantityRef.current.value = '0';
            setItemId(null);
            setBuyPrice(0);
            setSellPrice(0);
            setQuantity(0);
        }
    }, [props.visible])

    const searchRef:RefObject<TypeaheadInputElement> = useRef(null);
    const buyPriceRef:RefObject<HTMLInputElement> = useRef(null);
    const sellPriceRef:RefObject<HTMLInputElement> = useRef(null);
    const quantityRef:RefObject<HTMLInputElement> = useRef(null);

    return (<div className={classNames('modal', {
        'is-active': props.visible
    })}>
        <div className="modal-background"></div>
        <div className="modal-content is-overflow-visible">
            <div className="panel">
                <p className="panel-heading">Add New Transaction</p>
                <div className="panel-block">
                    <div className="control has-icons-left">
                        <span className="icon is-small is-left">
                            <i className="fas fa-search" />
                        </span>
                        <TypeaheadInput ref={searchRef} className="input" type="text" placeholder="Search for item..." suggestions={itemNames} onSuggestionSelect={
                            (suggestion: string, setValue) => {
                                setValue(suggestion);
                                setItemId(summary?.getItemByName(suggestion)?.id);
                            }} onChange={event => {
                                setItemId(summary?.getItemByName(event.currentTarget.value)?.id);
                            }} />
                    </div>
                </div>
                <div className="panel-block is-flex is-space-between">
                    <div className="field is-marginless">
                        <label className="label is-small">Buy Price</label>
                        <input ref={buyPriceRef} className="input is-small" type="number" min="0" defaultValue={0} onChange={(event) => {
                            setBuyPrice(parseInt(event.currentTarget.value));
                        }}/>
                    </div>
                    <div className="field is-marginless">
                        <label className="label is-small">Sell Price</label>
                        <input ref={sellPriceRef} className="input is-small" type="number" min="0" defaultValue={0} onChange={(event) => {
                            setSellPrice(parseInt(event.currentTarget.value));
                        }}/>
                    </div>
                    <div className="field is-marginless">
                        <label className="label is-small">Quantity</label>
                        <input ref={quantityRef} className="input is-small" type="number" min="0" defaultValue={0} onChange={(event) => {
                            setQuantity(parseInt(event.currentTarget.value));
                        }}/>
                    </div>
                </div>
                <div className="panel-block is-flex is-flex-end buttons">
                    <button disabled={!isValid} className={classNames("button is-small", {
                        'is-primary': isValid
                    })} onClick={() => {
                        props?.onTransactionCreate?.(createTransaction(itemId, buyPrice, sellPrice, quantity))
                    }}>Create Transaction</button>
                    <button className="button is-small" onClick={() => props?.onCancel?.()}>Cancel</button>
                </div>
            </div>
        </div>
        <button className="modal-close is-large" aria-label="close"></button>
    </div>);
}

export default NewTransactionModal;