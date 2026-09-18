import { definePatch } from "../modUtils.js"

export default definePatch(({ replaceCode }) => {

    replaceCode(`this.get = function () { return accountNames; };
        this.getListData = function () { return { aj: accountNames, value: 0 }; };
        this.isFollowed = function (accountName) { return utils.array.has(accountNames, accountName); };`,
        `this.get = function () { return accountNames; };
        __fx.followedAccounts.setSource(this.get);
        this.getListData = function () { return { aj: __fx.followedAccounts.decorate(accountNames), value: 0 }; };
        this.isFollowed = function (accountName) { return utils.array.has(accountNames, accountName); };`)
})
