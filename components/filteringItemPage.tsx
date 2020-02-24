import React, { ReactElement } from 'react';
import ItemSummaryGrid from '../components/itemSummaryGrid';
import usePriceSummary from '../hooks/usePriceSummary';
import { OsBuddyItemSummary } from '../types/osbuddy';


export type ItemFilter = (item: OsBuddyItemSummary) => boolean;

interface FilteringItemProps {
    filter: ItemFilter;
    subtitle: string;
}

const FilteringItemPage = (props: FilteringItemProps): ReactElement => {
    const { summary } = usePriceSummary();
    const items = summary?.getItems()
        ?.filter(props.filter)
        ?? [];

    return (
        <div className="section">
            <h1 className="title">Items</h1>
            <h2 className="subtitle">{props.subtitle}</h2>

            <ItemSummaryGrid items={items} />
        </div>
    );
}

export default FilteringItemPage;