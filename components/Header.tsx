import React, { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import classNames from 'classnames';

import TypeaheadInput from 'components/TypeaheadInput';
import usePriceSummary from 'hooks/usePriceSummary';

export default () => {
    const [searchValue, setSearchValue] = useState();
    const { summary } = usePriceSummary();
    const itemNames = summary?.getItems().map(item => item.name) ?? []
    const [isBurgerActive, setBurgerActive] = useState(false);
    const router = useRouter();

    return (
        <div className="navbar is-fixed-top" role="navigation">
            <div className="navbar-brand">
                <div className="navbar-item">
                    <span className="home-icon icon">
                        <i className="fas fa-coins fa-3x" />
                    </span>
                    <h1 className="title">
                        GoldMind
                    </h1>
                </div>
                <a role="button" className={classNames("navbar-burger", {
                    'is-active': isBurgerActive
                })} aria-label="menu" aria-expanded="false" data-target="navbarBasicExample"
                    onClick={() => setBurgerActive(!isBurgerActive)}>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>
            <div className={classNames("navbar-menu", {
                'is-active': isBurgerActive
            })}>
                <div className="navbar-start">
                    <Link href="/FavoriteItems" as="/favoriteItems"><a className="navbar-item">Favorites</a></Link>
                    <div className="navbar-item has-dropdown is-hoverable">
                        <Link href="/Transactions" as="/transactions"><a className="navbar-link">Transactions</a></Link>
                        <div className="navbar-dropdown">
                            <Link href="/Transactions" as="/transactions"><a className="navbar-item">Transaction Log</a></Link>
                            <div className="navbar-divider" />
                            <Link href="/MostProfitable" as="/mostProfitable"><a className="navbar-item">Most Profitable Items</a></Link>
                            <Link href="/TradeHistory" as="/tradeHistory"><a className="navbar-item">Trade History</a></Link>
                        </div>
                    </div>
                    <div className="navbar-item has-dropdown is-hoverable">
                        <Link href="/SuggestedItems" as="/suggestedItems"><a className="navbar-link">Flip Finder</a></Link>
                        <div className="navbar-dropdown">
                            <Link href="/SuggestedItems" as="/suggestedItems"><a className="navbar-item">Suggested Items</a></Link>
                            <Link href="/AllItems" as="/allItems"><a className="navbar-item">All Items</a></Link>
                            <Link href="/HighVolume" as="/highVolume"><a className="navbar-item">High Volume</a></Link>
                            <Link href="/HighestMargin" as="/highestMargin"><a className="navbar-item">High Margin</a></Link>
                            <div className="navbar-divider" />
                            <div className="navbar-item has-dropdown is-hoverable">
                                <a className="navbar-link">Item Categories</a>
                                <div className="navbar-dropdown">
                                    <Link href="/category/Runes" as="/category/runes"><a className="navbar-item">Runes</a></Link>
                                    <Link href="/category/Construction" as="/category/construction"><a className="navbar-item">Construction</a></Link>
                                    <Link href="/category/Crafting" as="/category/crafting"><a className="navbar-item">Crafting</a></Link>
                                    <Link href="/category/Farming" as="/category/farming"><a className="navbar-item">Farming</a></Link>
                                    <Link href="/category/Fletching" as="/category/fletching"><a className="navbar-item">Fletching</a></Link>
                                    <Link href="/category/Herblore" as="/category/herblore"><a className="navbar-item">Herblore</a></Link>
                                    <Link href="/category/Implings" as="/category/implings"><a className="navbar-item">Implings</a></Link>
                                    <Link href="/category/Logs" as="/category/logs"><a className="navbar-item">Logs</a></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="navbar-item has-dropdown is-hoverable">
                        <a className="navbar-link">Money Making</a>
                        <div className="navbar-dropdown">
                            <Link href="/Decanting" as="/decanting"><a className="navbar-item">Decanting</a></Link>
                            <Link href="/ItemSets" as="/itemSets"><a className="navbar-item">Item Sets</a></Link>
                        </div>
                    </div>
                </div>
                <div className="navbar-end">
                    <div className="navbar-item">
                        <div className="field has-addons">
                            <div className="control has-icons-left">
                                <span className="icon is-small is-left">
                                    <i className="fas fa-search" />
                                </span>
                                <TypeaheadInput className="input" type="text" placeholder="Search for items..." suggestions={itemNames}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                    onKeyUp={(event) => {
                                        if (event.keyCode === 13) {
                                            router.push({
                                                pathname: '/Search',
                                                query: { q: event.currentTarget.value }
                                            }, '/search')
                                            event.currentTarget.blur();
                                        }
                                    }}
                                    onSuggestionSelect={(suggestion, setValue) => {
                                        setValue('');
                                        const suggestedItem = summary.getItemByName(suggestion);
                                        if (suggestedItem) {
                                            router.push({
                                                pathname: '/Item',
                                                query: { id: suggestedItem.id }
                                            }, '/item');
                                        }
                                    }
                                    } />
                            </div>
                            <div className="control">
                                <Link href={{ pathname: "/Search", query: { q: searchValue } }} >
                                    <a className="button is-info">
                                        Search
                                    </a>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};