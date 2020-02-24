import { OsBuddyItemSummary } from "../types/osbuddy";
import { ItemFilter } from "../components/filteringItemPage";

const whitelistItemFilter = (whitelist: Set<String | RegExp | number>):ItemFilter => {
    return (item: OsBuddyItemSummary): boolean => {
        for (let val of whitelist.values()) {
            if (val instanceof RegExp) {
                if (val.test(item.name)) {
                    return true;
                }
            } else if (typeof val === 'number') {
                if (val === item.id) {
                    return true;
                }
            }
        }
        return whitelist.has(item.name.toLowerCase());
    }
}

export default whitelistItemFilter;