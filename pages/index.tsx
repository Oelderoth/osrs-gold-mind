import React from 'react';
import { NextPage } from 'next';
import usePriceSummary from '../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../types/osbuddy';
import {highVolumeFilter, highestMarginFilter, suggestedItemFilter} from '../filters';


function profitMarginSort(itemA: OsBuddyItemSummary, itemB: OsBuddyItemSummary): number {
    return (itemB.buy_average - itemB.sell_average) - (itemA.buy_average - itemA.sell_average);
}

const Index: NextPage = function () {
    const {summary} = usePriceSummary();

    return (<div>
        {summary?.getItem(44)?.name} <br />
        <ul>
            {summary?.getItems()
                .filter(highVolumeFilter)
                .sort(profitMarginSort)
                .map(item => <li>{`${item.name} - ${item.buy_average - item.sell_average} (${item.buy_average} >> ${item.sell_average})`}</li>)}
        </ul>
    </div>);
}

export default Index;