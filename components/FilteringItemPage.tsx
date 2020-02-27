import React, { ReactElement, useEffect, useState, Fragment } from 'react';

import classNames from 'classnames';

import ItemSummaryGrid from 'components/ItemSummaryGrid';
import usePersistedState from 'hooks/usePersistedState';
import usePriceSummary from 'hooks/usePriceSummary';
import { OsBuddyItemSummary } from 'types/OsBuddy';
import ItemSearchFilter from 'utils/ItemSearchFilter';

import FilterItemModal, { FilterConfiguration, ItemFilter as ItemModalFilter } from './FilterItemModal';
import { SortableTablePagination } from './SortableTable';

export type ItemFilter = (item: OsBuddyItemSummary) => boolean;

interface FilteringItemProps extends React.ComponentPropsWithoutRef<'div'> {
    filter: ItemFilter;
    subtitle: string;
    pageKey?: string;
}

const FilteringItemPage = (props: FilteringItemProps): ReactElement => {
    const { summary } = usePriceSummary();
    const [modalVisible, setModalVisible] = useState(false);
    const [filterConfiguration, setFilterConfiguration] = props.pageKey ? usePersistedState<FilterConfiguration>(`${props.pageKey.toString()}-item-filter-configuration`, null) : useState();
    const [itemNameFilter, setItemNameFilter] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!summary) return;
        const searchFilter = ItemSearchFilter(itemNameFilter, true);
        setItems(summary.getItems().filter(ItemModalFilter(filterConfiguration)).filter(item => searchFilter(item.name)));
    }, [summary, filterConfiguration, itemNameFilter]);

    return (
        <Fragment>
            <div className="section">
                <ItemSummaryGrid items={items} automaticPagination={false}>
                    <div className="is-flex is-space-between">
                        <div>
                            <h1 className="title">Items</h1>
                            <h2 className="subtitle">{props.subtitle}</h2>
                        </div>
                        <div>
                            <div className="is-flex is-flex-end field">
                                <div className="item-name-filter control">
                                    <input type="text" className="input is-small" placeholder="Filter by item..." onChange={(e) => setItemNameFilter(e.target.value)} />
                                </div>
                                <div className="is-marginless">
                                    <a className={classNames("button is-small", { 'is-info is-light': !!filterConfiguration })} onClick={() => setModalVisible(true)}>
                                        <span className="icon is-small">
                                            <i className="fas fa-filter" />
                                        </span>
                                        <span>Filter Items</span>
                                    </a>
                                </div>
                            </div>
                            <div>
                                <SortableTablePagination />
                            </div>
                        </div>
                    </div>
                </ItemSummaryGrid>>
            </div>
            <FilterItemModal visible={modalVisible}
                initialFilter={filterConfiguration}
                onApplyFilter={(config) => {
                    setFilterConfiguration(config);
                    setModalVisible(false);
                }}
                onClearFilter={() => {
                    setFilterConfiguration(null);
                    setModalVisible(false);
                }}
                onCancel={() => setModalVisible(false)} />
        </Fragment>
    );
}

export default FilteringItemPage;