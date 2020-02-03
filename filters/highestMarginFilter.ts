import {OsBuddyItemSummary} from '../types/osbuddy';

/**
 * Returns items with up to date buy and sell prices, and a buy or sell quantity >= 5000
 */
function highestMarginFilter(itemSummary:OsBuddyItemSummary) : Boolean {
    return (itemSummary.sell_average > 0 && itemSummary.buy_average > 0) 
    && (itemSummary.buy_quantity >= 1 || itemSummary.sell_quantity >= 1);
}

export default highestMarginFilter;