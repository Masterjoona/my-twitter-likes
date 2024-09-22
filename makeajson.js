import { writeFileSync } from 'fs';

const initialRequest = // PASTE OVER THIS COMMENT AND REPLACE `fetch` WITH `new Request`

const urlParams = new URLSearchParams(initialRequest.url.split("?")[1]);
const oldVariables = JSON.parse(urlParams.get("variables"));

const createUrlWithVariables = (baseUrl, variables) => {
    urlParams.set("variables", JSON.stringify(variables));
    return `${baseUrl}?${urlParams.toString()}`;
};

const fetchTweets = async (url, request) => {
    const response = await fetch(new Request(url, request));
    return response.json();
};

const baseUrl = initialRequest.url.split("?")[0];
const initialVariables = { ...oldVariables, count: 100 };
const initialUrl = createUrlWithVariables(baseUrl, initialVariables);
const initialJson = await fetchTweets(initialUrl, initialRequest);
const initialEntries = initialJson.data.user.result.timeline_v2.timeline.instructions[0].entries;

let cursor = initialEntries[initialEntries.length - 1]?.content.value;
let prevCursor = null;
let tweets = [...initialEntries];

// now that we have the first cursor, we can loop to get the remaining tweets
while (cursor !== prevCursor) {
    const newCursorVariables = { ...initialVariables, cursor };
    const currentUrl = createUrlWithVariables(baseUrl, newCursorVariables);
    const currentJson = await fetchTweets(currentUrl, initialRequest);
    const currentEntries = currentJson.data.user.result.timeline_v2.timeline.instructions[0].entries;


    tweets.push(...currentEntries);
    prevCursor = cursor;
    cursor = currentEntries[currentEntries.length - 1].content.value;
    console.log(`Got ${tweets.length} tweets - cursor: ${cursor}`)
}

function compressLikes(uglyLikes) {
    const compressedLikes = {
        tweets: [],
        authors: []
    };
    const alreadySeenAuthors = {};
    for (const like of uglyLikes) {
        if (like.content?.entryType === "TimelineTimelineCursor") {
            continue;
        }
        let author;
        try {
            if (like.content.itemContent.tweet_results.result?.core?.user_results.result) {
                author = like.content.itemContent.tweet_results.result.core.user_results.result;
            } else {
                author = like.content.itemContent.tweet_results?.result?.tweet?.core.user_results.result;
            }
        } catch (e) {
            console.log(JSON.stringify(like, null, 2));
            throw e;
        }

        compressedLikes.tweets.push(like.content.itemContent.tweet_results.result?.legacy);
        if (!alreadySeenAuthors[author?.rest_id]) {
            compressedLikes.authors.push(author);
            alreadySeenAuthors[author?.rest_id] = true;
        }
    }
    return compressedLikes;
}

writeFileSync("minified_likes.json", JSON.stringify(compressLikes(tweets), null), 'utf8');