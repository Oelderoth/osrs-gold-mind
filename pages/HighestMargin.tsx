import React from 'react';

import FilteringItemPage from 'components/FilteringItemPage';
import { OsBuddyItemSummary } from 'types/OsBuddy';

/**
 * Returns items with up to date buy and sell prices, and a buy or sell quantity >= 5000
 */
function highestMarginFilter(itemSummary:OsBuddyItemSummary) : boolean {
    return (itemSummary.sell_average > 0 && itemSummary.buy_average > 0) 
    && (itemSummary.buy_quantity >= 1 || itemSummary.sell_quantity >= 1);
}

export default function () {
    return (<FilteringItemPage pageKey={'highest-margin'} subtitle={'Highest Margin Items'} filter={highestMarginFilter} />)
}