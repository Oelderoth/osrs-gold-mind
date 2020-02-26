import React, { ReactElement, useState, useContext, useEffect, Fragment, ReactNode } from "react";

import classNames from 'classnames';

interface SortableTableProps extends React.ComponentPropsWithoutRef<'table'> {
    children?: React.ReactNode;
    defaultField: string;
    defaultAscending?: boolean;
    pageSize?: number;
    headerContent?: React.ReactNode;
}

interface SortableThProps extends React.ComponentPropsWithoutRef<'th'> {
    fieldName: string;
}

interface SortableRowsProps<T> {
    items: T[];
    rowMapper: (item: T) => React.ReactNode;
    valueExtractor?: (obj: any, field: string) => any;
}

interface SortableTableContext {
    sortedField: string;
    ascending: boolean;
    defaultAscending: boolean;
    offset?: number;
    count?: number;
    itemCount: number;
    setSortedField: (val: string) => void;
    setAscending: (val: boolean) => void;
    setItemCount: (val: number) => void;
    setPage: (val: number) => void;
}

const SortableTableContext = React.createContext({
    sortedField: '',
    ascending: true,
    defaultAscending: true,
    offset: null,
    count: null,
    itemCount: 0,
    setSortedField: (_) => { },
    setAscending: (_) => { },
    setItemCount: (_) => { },
    setPage: (_) => { }
} as SortableTableContext);

export function SortableTh(props: SortableThProps): ReactElement {
    const { sortedField, ascending, defaultAscending, setSortedField, setAscending } = useContext(SortableTableContext);
    const { fieldName, className, children, ...other } = props;
    return (
        <th className={classNames('has-pointer is-hoverable', className)} onClick={() => {
            if (sortedField === fieldName) {
                setAscending(!ascending);
            } else {
                setAscending(defaultAscending);
                setSortedField(fieldName);
            }
        }} {...other}>
            <div className="is-flex is-align-center">
                {children}
                <span className="icon is-pulled-right">
                    {sortedField === fieldName && <i className={classNames("fas", { 'fa-sort-up': ascending, 'fa-sort-down': !ascending })} />}
                </span>
            </div>
        </th>
    );
}

export function SortableRows<T>(props: SortableRowsProps<T>): ReactElement {
    const { sortedField, ascending, count, offset, setItemCount, setPage } = useContext(SortableTableContext);
    const [sortedItems, setSortedItems] = useState([]);

    const valueExtractor: (obj: any, field: string) => any = props.valueExtractor ?? ((obj: any, field: string) => {
        return obj[field];
    });

    useEffect(() => {
        setItemCount(props.items.length);
        setPage(1);
        let sortedItems = [...props.items];
        sortedItems.sort((a, b) => {
            const valA = valueExtractor(a, sortedField);
            const valB = valueExtractor(b, sortedField);
            if (typeof valA === 'number') {
                return ascending ? valA - valB : valB - valA
            } else {
                return ascending ? valB.toString().localeCompare(valA.toString()) : valA.toString().localeCompare(valB.toString());
            }
        })
        setSortedItems(sortedItems);
    }, [props.items, sortedField, ascending]);

    const currentPage = (offset || count) ? sortedItems.slice(offset ?? 0, (offset ?? 0) + count) : sortedItems;

    return (<Fragment>
        {currentPage.map(props.rowMapper)}
    </Fragment>);
}

const buildPagination = (itemCount: number, pageSize: number, page: number, setPage:(p: number)=>void): ReactNode => {
    const pageCount = Math.ceil(itemCount / pageSize);

    const elements = [];

    const paginationLink = (p: number) => {
        return (<p className="control"><a key={`pagination-${p}`} className={classNames("button is-small", {
            'is-primary': page === p
        })} onClick={() => setPage(p)}>{p}</a></p>);
    }

    if (pageCount <= 6) {
        for (let i = 1; i <= pageCount; i++) {
            elements.push(paginationLink(i));
        }
    } else {
        elements.push(paginationLink(1));

        if (page <= 4) {
            elements.push(paginationLink(2));
            elements.push(paginationLink(3));
            elements.push(paginationLink(4));
            elements.push(paginationLink(5));
            elements.push(<p className="control"><a key={'e1'} className="button is-static is-borderless is-small">&hellip;</a></p>);
            elements.push(paginationLink(pageCount));
        } else if (page >= pageCount - 3) {
            elements.push(<p className="control"><a key={'e1'} className="button is-static is-borderless is-small">&hellip;</a></p>);
            elements.push(paginationLink(pageCount - 4));
            elements.push(paginationLink(pageCount - 3));
            elements.push(paginationLink(pageCount - 2));
            elements.push(paginationLink(pageCount - 1));
            elements.push(paginationLink(pageCount));
        } else {
            elements.push(<p className="control"><a key={'e1'} className="button is-static is-borderless is-small">&hellip;</a></p>);

            for (let i = Math.max(2, page - 1); i <= Math.min(page + 1, pageCount - 1); i++) {
                elements.push(paginationLink(i));
            }

            elements.push(<p className="control"><a key={'e2'} className="button is-static is-borderless is-small">&hellip;</a></p>);
            elements.push(paginationLink(pageCount));
        }
    }

    return elements;
}

export function SortableTable(props: SortableTableProps): ReactElement {
    const { defaultField, defaultAscending = true, pageSize, children, headerContent, ...other } = props;
    const [sortedField, setSortedField] = useState(defaultField);
    const [ascending, setAscending] = useState(defaultAscending);
    const [itemCount, setItemCount] = useState(0);
    const [page, setPage] = useState(1);

    const showPages = pageSize ? itemCount > pageSize : false;

    return (
        <SortableTableContext.Provider value={{
            sortedField,
            ascending,
            offset: pageSize ? pageSize * (page - 1) : 0,
            count: pageSize,
            defaultAscending: defaultAscending,
            itemCount,
            setSortedField,
            setAscending,
            setItemCount,
            setPage
        }}>
            <div className=''>
                {headerContent}
                {showPages && <div className="table-pagination field has-addons is-pulled-right">
                    <p className="control">
                        <button className="button is-small" disabled={page === 1} onClick={() => setPage(page-1)}><span className='icon'><i className="fas fa-chevron-left" /></span></button>
                    </p>
                    {buildPagination(itemCount, pageSize, page, setPage)}
                    <p className="control">
                        <button className="button is-small" disabled={page === Math.ceil(itemCount/pageSize)} onClick={() => setPage(page+1)}><span className='icon'><i className="fas fa-chevron-right" /></span></button>
                    </p>
                </div>}
            </div>
            <table {...other}>
                {children}
            </table>
        </SortableTableContext.Provider>)
}
