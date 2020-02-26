import React, { ReactElement } from 'react';

import ItemSummaryGrid from 'components/ItemSummaryGrid';
import usePriceSummary from 'hooks/usePriceSummary';
import { OsBuddyItemSummary } from 'types/OsBuddy';

export type ItemFilter = (item: OsBuddyItemSummary) => boolean;

interface FilteringItemProps extends React.ComponentPropsWithoutRef<'div'>{
    filter: ItemFilter;
    subtitle: string;
    pageKey?: string;
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

            <ItemSummaryGrid pageKey={props.pageKey} items={items} />
        </div>
    );
}

export default FilteringItemPage;