import {OsBuddyItemSummary} from '../types/osbuddy';

/**
 * Returns items with up to date buy and sell prices, and a buy or sell quantity >= 5000
 */
function suggestedItemFilter(itemSummary:OsBuddyItemSummary) : Boolean {
    return (itemSummary.sell_average > 0) 
    && (itemSummary.buy_quantity >= 2 || itemSummary.sell_quantity >= 2)
    && (itemSummary.overall_average <= 50000000)
    && ((itemSummary.buy_average - itemSummary.sell_average)/itemSummary.sell_average > 0.015)
    && ((itemSummary.buy_quantity / itemSummary.sell_quantity) > 0.5);
}

export default suggestedItemFilter;