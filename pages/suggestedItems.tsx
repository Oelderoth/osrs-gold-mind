import React from 'react';
import FilteringItemPage from '../components/filteringItemPage';
import { OsBuddyItemSummary } from '../types/osbuddy';
import '../styles.scss';

/**
 * Returns items with up to date buy and sell prices, and a buy or sell quantity >= 5000
 */
function suggestedItemFilter(itemSummary:OsBuddyItemSummary) : boolean {
    return (itemSummary.sell_average > 150) 
    && (itemSummary.buy_quantity >= 2 && itemSummary.sell_quantity >= 2)
    && (itemSummary.overall_average <= 50000000)
    && ((itemSummary.buy_average - itemSummary.sell_average)/itemSummary.sell_average > 0.01)
    && ((itemSummary.sell_quantity / itemSummary.buy_quantity) > 0.5);
}

export default function () {
    return (<FilteringItemPage subtitle={'Suggested Items'} filter={suggestedItemFilter} />)
}