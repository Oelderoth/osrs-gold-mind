import React, { ReactElement, useState, useContext, useEffect, Fragment } from "react";

import classNames from 'classnames';

interface SortableTableProps extends React.ComponentPropsWithoutRef<'table'>{
    children?: React.ReactNode;
    defaultField: string;
    defaultAscending?: boolean;
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
    setSortedField: (val:string) => void;
    setAscending: (val:boolean) => void;
}


const SortableTableContext = React.createContext({ 
    sortedField: '',
    ascending: true,
    defaultAscending: true,
    setSortedField: (_) => {},
    setAscending: (_) => {}
} as SortableTableContext);

export function SortableTh(props: SortableThProps): ReactElement {
    const {sortedField, ascending, defaultAscending, setSortedField, setAscending} = useContext(SortableTableContext);
    const {fieldName, className, children, ...other} = props;
    return (
        <th className={classNames('has-pointer is-hoverable', className)} onClick={()=>{
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
                    {sortedField === fieldName && <i className={classNames("fas", {'fa-sort-up': ascending, 'fa-sort-down': !ascending})} />}
                </span>
            </div>
        </th>
    );
}

export function SortableRows<T>(props:SortableRowsProps<T>): ReactElement {
    const {sortedField, ascending} = useContext(SortableTableContext);
    const [sortedItems, setSortedItems] = useState([]);

    const valueExtractor: (obj: any, field:string) => any = props.valueExtractor ?? ((obj: any, field: string) => {
        return obj[field];
    });

    useEffect(() => {
        const sortedItems = [...props.items];
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

    return (<Fragment>
        {sortedItems.map(props.rowMapper)}
    </Fragment>);
}

export function SortableTable(props: SortableTableProps): ReactElement{
    const {defaultField, defaultAscending = true, children, ...other} = props;
    const [sortedField, setSortedField] = useState(defaultField);
    const [ascending, setAscending] = useState(defaultAscending);
    return (
    <SortableTableContext.Provider value={{
        sortedField,
        ascending,
        defaultAscending: defaultAscending,
        setSortedField,
        setAscending
    }}>
        <table {...other}>
            {children}
        </table>
    </SortableTableContext.Provider>)
}
