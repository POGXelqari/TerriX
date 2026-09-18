import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";
import { getSettings } from "./settings.js";

const PLACEHOLDER_NAME = "Hidden Name";

const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers
});

function isInappropriate(name) {
    return matcher.hasMatch(name);
}

function filter(name) {
    if (typeof name !== "string" || !getSettings().hideInappropriateNames) return name;
    return isInappropriate(name) ? PLACEHOLDER_NAME : name;
}

export default { filter, isInappropriate };
