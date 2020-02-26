import { ReactElement, useRef, RefObject, useEffect, useState } from 'react';

import classNames from 'classnames';
import { OsBuddyPriceSummary, OsBuddyItemSummary } from 'types/OsBuddy';

export interface FilterConfiguration {
    priceMin?: number;
    priceMax?: number;
    buyQuantityMin?: number;
    buyQuantityMax?: number;
    sellQuantityMin?: number;
    sellQuantityMax?: number;
}

interface FilterItemModalProps {
    visible: boolean;
    initialFilter?: FilterConfiguration;
    onApplyFilter: (filter: FilterConfiguration) => void;
    onClearFilter: () => void;
    onCancel: () => void;
}

const FilterItemModal = (props: FilterItemModalProps): ReactElement => {
    const [priceMin, setPriceMin] = useState(0);
    const [buyQuantityMin, setBuyQuantityMin] = useState(0);
    const [sellQuantityMin, setSellQuantityMin] = useState(0);
    const [priceMax, setPriceMax] = useState(0);
    const [buyQuantityMax, setBuyQuantityMax] = useState(0);
    const [sellQuantityMax, setSellQuantityMax] = useState(0);

    // If the visibility changes to true and we have an initialFilter, set inputs to initial values
    useEffect(() => {
        if (props.visible) {
            setPriceMin(props.initialFilter?.priceMin ?? 0)
            setBuyQuantityMin(props.initialFilter?.buyQuantityMin ?? 0)
            setSellQuantityMin(props.initialFilter?.sellQuantityMin ?? 0)
            setPriceMax(props.initialFilter?.priceMax ?? 0)
            setBuyQuantityMax(props.initialFilter?.buyQuantityMax ?? 0)
            setSellQuantityMax(props.initialFilter?.sellQuantityMax ?? 0)
        }
    }, [props.visible])

    const stateOnChangeNumberHandler = (dispatch: (val: number) => void) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(parseInt(e.target.value));
        }
    }

    return (<div className={classNames('modal', {
        'is-active': props.visible
    })}>
        <div className="modal-background" onClick={() => props?.onCancel?.()}></div>
        <div className="modal-content is-overflow-visible">
            <div className="panel">
                <p className="panel-heading">Filter Items</p>
                <div className="panel-block is-flex columns">
                    <div className="column">
                        <div className="field is-marginless">
                            <label className="label is-small">Price (Min)</label>
                            <input value={priceMin ? priceMin : ''} onChange={stateOnChangeNumberHandler(setPriceMin)} className="input is-small" type="number" min="0" placeholder="0"/>
                        </div>
                        <div className="field is-marginless">
                            <label className="label is-small">Buy Quantity (Min)</label>
                            <input value={buyQuantityMin ? buyQuantityMin : ''} onChange={stateOnChangeNumberHandler(setBuyQuantityMin)} className="input is-small" type="number" min="0" placeholder="0"/>
                        </div>
                        <div className="field is-marginless">
                            <label className="label is-small">Sell Quantity (Min)</label>
                            <input value={sellQuantityMin ? sellQuantityMin : ''} onChange={stateOnChangeNumberHandler(setSellQuantityMin)} className="input is-small" type="number" min="0" placeholder="0"/>
                        </div>
                    </div>
                    <div className="column">
                        <div className="field is-marginless">
                            <label className="label is-small">Price (Max)</label>
                            <input value={priceMax ? priceMax : ''} onChange={stateOnChangeNumberHandler(setPriceMax)} className="input is-small" type="number" min="0" placeholder="0"/>
                        </div>
                        <div className="field is-marginless">
                            <label className="label is-small">Buy Quantity (Max)</label>
                            <input value={buyQuantityMax ? buyQuantityMax : ''} onChange={stateOnChangeNumberHandler(setBuyQuantityMax)} className="input is-small" type="number" min="0" placeholder="0"/>
                        </div>
                        <div className="field is-marginless">
                            <label className="label is-small">Sell Quantity (Max)</label>
                            <input value={sellQuantityMax ? sellQuantityMax : ''} onChange={stateOnChangeNumberHandler(setSellQuantityMax)} className="input is-small" type="number" min="0" placeholder="0"/>
                        </div>
                    </div>
                </div>
                <div className="panel-block is-flex is-flex-end">
                    <div className="buttons">
                        <button className={'button is-small is-primary'} onClick={() => {
                            props?.onApplyFilter?.({
                                priceMin: priceMin ? priceMin : null,
                                buyQuantityMin: buyQuantityMin ? buyQuantityMin : null,
                                sellQuantityMin: sellQuantityMin ? sellQuantityMin : null,
                                priceMax: priceMax ? priceMax : null,
                                buyQuantityMax: buyQuantityMax ? buyQuantityMax : null,
                                sellQuantityMax: sellQuantityMax ? sellQuantityMax : null
                            })
                        }}>Apply Filter</button>
                        {props.initialFilter && <button className={'button is-small is-danger is-light is-active'} onClick={() => props?.onClearFilter?.()}>Clear Filter</button>}
                        <button className="button is-small" onClick={() => props?.onCancel?.()}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={() => props?.onCancel?.()}></button>
    </div>);
}

export default FilterItemModal;

export function ItemFilter(config: FilterConfiguration): (item: OsBuddyItemSummary) => boolean {
    return (item: OsBuddyItemSummary): boolean => {
        if (!config) return true;
        if (config.priceMin && item.overall_average < config.priceMin) return false;
        if (config.priceMax && item.overall_average > config.priceMax) return false;
        if (config.buyQuantityMin && item.buy_quantity < config.buyQuantityMin) return false;
        if (config.buyQuantityMax && item.buy_quantity > config.buyQuantityMax) return false;
        if (config.sellQuantityMin && item.sell_quantity < config.sellQuantityMin) return false;
        if (config.sellQuantityMax && item.sell_quantity > config.sellQuantityMax) return false;
        return true;
    }
}