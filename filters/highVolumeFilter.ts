import {OsBuddyItemSummary} from '../types/osbuddy';

/**
 * Returns items with up to date buy and sell prices, and a buy or sell quantity >= 5000
 */
function highVolumeFilter(itemSummary:OsBuddyItemSummary) : Boolean {
    return (itemSummary.sell_average > 0 && itemSummary.buy_average > 0) && (itemSummary.buy_quantity >= 5000 || itemSummary.sell_quantity >= 5000);
}

export default highVolumeFilter;