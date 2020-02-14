import React, { useState } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import TypeaheadInput from '../components/typeaheadInput';
import usePriceSummary from '../hooks/usePriceSummary';
import { useRouter } from 'next/router';
import { suggestedItemFilter } from '../filters';

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
                        <i className="fas fa-coins fa-3x"/>
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
                    <Link href="/favoriteItems"><a className="navbar-item">Favorites</a></Link>
                    <Link href="/suggestedItems"><a className="navbar-item">Suggested Items</a></Link>
                    <div className="navbar-item has-dropdown is-hoverable">
                        <a className="navbar-link">Others</a>
                        <div className="navbar-dropdown">
                            <Link href="/highVolume"><a className="navbar-item">High Volume</a></Link>
                            <Link href="/highestMargin"><a className="navbar-item">High Margin</a></Link>
                        </div>
                    </div>
                    <div className="navbar-item has-dropdown is-hoverable">
                        <a className="navbar-link">Tags</a>
                        <div className="navbar-dropdown">
                            <a className="navbar-item">Before</a>
                            <div className="navbar-item has-dropdown is-hoverable">
                                <a className="navbar-link">Herblore</a>
                                <div className="navbar-dropdown">
                                    <Link href="/highVolume"><a className="navbar-item">Unfinished Potions</a></Link>
                                    <Link href="/highestMargin"><a className="navbar-item">Secondaries</a></Link>
                                    <div className="navbar-item has-dropdown is-hoverable">
                                        <a className="navbar-link">Nested</a>
                                        <div className="navbar-dropdown">
                                            <Link href="/highVolume"><a className="navbar-item"> Potions</a></Link>
                                            <Link href="/highestMargin"><a className="navbar-item">Secondaries</a></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <a className="navbar-item">After</a>
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
                                                pathname: '/search',
                                                query: {q: event.currentTarget.value}
                                            })
                                            event.currentTarget.blur();
                                        }
                                    }}
                                    onSuggestionSelect={(suggestion, setValue) => {
                                        setValue('');
                                        console.log(suggestion);
                                        const suggestedItem = summary.getItemByName(suggestion);
                                        if (suggestedItem) {
                                            console.log(suggestedItem);
                                            router.push({
                                                pathname: '/item',
                                                query: {id: suggestedItem.id}
                                            });
                                        }}
                                    }/>
                            </div>
                            <div className="control">
                                <Link href={{pathname: "/search", query:{q:searchValue}}} >
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