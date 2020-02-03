import React from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../types/osbuddy';
import {highVolumeFilter} from '../filters';

import '../styles.scss';

function profitMarginSort(itemA: OsBuddyItemSummary, itemB: OsBuddyItemSummary): number {
    return (itemB.buy_average - itemB.sell_average) - (itemA.buy_average - itemA.sell_average);
}

const HighVolume: NextPage = function () {
    const {summary} = usePriceSummary();

    return (
        <div>
            <h1 className="title">
                Bulma
            </h1>

            <p className="subtitle">
                Modern CSS framework based on <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox">Flexbox</a>
            </p>

            <div className="field">
                <div className="control">
                    <input className="input" type="text" placeholder="Input" />
                </div>
            </div>

            <div className="field">
                <p className="control">
                <span className="select">
                    <select>
                    <option>Select dropdown</option>
                    </select>
                </span>
                </p>
            </div>

            <div className="buttons">
                <a className="button is-primary">Primary</a>
                <a className="button is-link">Link</a>
            </div>
        </div>
    );
}

export default HighVolume;