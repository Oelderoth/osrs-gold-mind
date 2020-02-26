import React, { Fragment, ReactElement, useState, useEffect } from 'react';

import Link from 'next/link';

import classNames from 'classnames';

import FavoriteStar from 'components/FavoriteStar';
import FilterItemModal, { FilterConfiguration, ItemFilter } from 'components/FilterItemModal';
import { SortableRows, SortableTable, SortableTh } from 'components/SortableTable';
import { OsBuddyItemSummary } from 'types/OsBuddy';
import ItemSearchFilter from 'utils/ItemSearchFilter';
import usePersistedState from 'hooks/usePersistedState';

interface ItemGridProps extends React.ComponentPropsWithoutRef<'div'>{
    items: OsBuddyItemSummary[];
    pageSize?: number;
    pageKey?: string;
}

function itemRow(item: OsBuddyItemSummary): ReactElement {
    return <tr key={item.id}>
        <td><img className={'item-icon-small'} src={`http://services.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=${item.id}`} /></td>
        <td><Link href={{pathname: "/item", query:{id:item.id}}}><a>{item.name}</a></Link></td>
        <td>{item.overall_average.toLocaleString()}</td>
        <td>{item.sell_average.toLocaleString()}</td>
        <td>{item.buy_average.toLocaleString()}</td>
        <td>
            <span className={
                classNames({
                    'has-text-success': item.profit >= 0,
                    'has-text-danger': item.profit < 0
                })
            }>{item.profit >= 0 ? '+' : null}{item.profit.toLocaleString()}</span>
        </td>
        <td>{`${item.returnOnInvestment.toFixed(2)}%`}</td>
        <td>{item.buy_quantity.toLocaleString()}</td>
        <td>{item.sell_quantity.toLocaleString()}</td>
        <td>
            <span className={
                classNames({
                    'has-text-success': item.buySellRatio > 1,
                    'has-text-danger': item.buySellRatio <= 1
                })
            }>{item.buySellRatio.toFixed(2)}</span>
        </td>
        <td className="has-text-centered"><FavoriteStar id={item.id.toString()}/></td>
    </tr>
}

const ItemSummaryGrid = function (props: ItemGridProps): ReactElement {
    const [key] = useState(props.pageKey)
    const [modalVisible, setModalVisible] = useState(false);
    const [filterConfiguration, setFilterConfiguration] = key ? usePersistedState<FilterConfiguration>(`${key.toString()}-item-filter-configuration`, null) : useState();
    const [filteredItems, setFilteredItems] = useState(props.items);
    const [itemNameFilter, setItemNameFilter] = useState('');

    useEffect(() => {
        const searchFilter = ItemSearchFilter(itemNameFilter, true);
        setFilteredItems([...props.items].filter(ItemFilter(filterConfiguration)).filter(item => searchFilter(item.name)));
    }, [props.items, filterConfiguration, itemNameFilter]);

    return (
        <Fragment key={key}>
            <SortableTable className="table is-fullwidth is-hoverable" 
                defaultField={'profit'} 
                defaultAscending={false}
                pageSize={props.pageSize ?? 15}
                headerContent={<div className="is-flex is-flex-end field">
                    <div className="item-name-filter control">
                            <input type="text" className="input is-small" placeholder="Filter by item..." onChange={(e) => setItemNameFilter(e.target.value)}/>
                    </div>
                    <div className="is-marginless">
                        <a className={classNames("button is-small", {'is-info is-light': !!filterConfiguration})} onClick={() => setModalVisible(true)}>
                            <span className="icon is-small">
                                <i className="fas fa-filter" />
                            </span>
                            <span>Filter Items</span>
                        </a>
                    </div>
                </div>}>
                <thead>
                    <tr>
                        <SortableTh fieldName={'name'} colSpan={2}>Name</SortableTh>
                        <SortableTh fieldName={'overall_average'}>Price</SortableTh>
                        <SortableTh fieldName={'sell_average'}>Offer Price</SortableTh>
                        <SortableTh fieldName={'buy_average'}>Sell Price</SortableTh>
                        <SortableTh fieldName={'profit'}>Profit</SortableTh>
                        <SortableTh fieldName={'returnOnInvestment'}>ROI</SortableTh>
                        <SortableTh fieldName={'buy_quantity'}>Buy Quantity</SortableTh>
                        <SortableTh fieldName={'sell_quantity'}>Sell Quantity</SortableTh>
                        <SortableTh fieldName={'buySellRatio'}>Buy/Sell Ratio</SortableTh>
                        <th>Favorite</th>
                    </tr>
                </thead>
                <tbody>
                    <SortableRows items={filteredItems} rowMapper={itemRow} />
                </tbody>
            </SortableTable>
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
                onCancel={() => setModalVisible(false)}/>
        </Fragment>
    );
}

export default ItemSummaryGrid;