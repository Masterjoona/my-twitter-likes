const originalXMLHttpRequest = window.XMLHttpRequest;
const tweets = [];
const authorData = {};
const seenAuthors = new Set();


function extractAuthor(tweet_results) {
    try {
        return tweet_results.result?.core?.user_results.result || tweet_results.result?.tweet?.core.user_results.result;
    } catch (error) {
        console.error("Error extracting author:", error);
        console.log(JSON.stringify(tweet_results, null, 2));
        return null;
    }
}

function extractLikedTweet(like) {
    const tweetResult = like.content.itemContent.tweet_results.result;

    if (!tweetResult) return null;

    const likedTweet = { ...tweetResult.legacy };

    if (tweetResult.quoted_status_result) {
        try {
            const quoteAuthor = extractAuthor(tweetResult.quoted_status_result);
            likedTweet.quoted_status_result = tweetResult.quoted_status_result?.result?.tweet?.legacy || tweetResult.quoted_status_result?.result?.legacy;
            if (quoteAuthor) {
                authorData[quoteAuthor.rest_id] = quoteAuthor;
                seenAuthors.add(quoteAuthor.rest_id);
            }
        } catch (error) {
            console.error("Error extracting quoted tweet:", error);
            console.log(JSON.stringify(like, null, 2));
            throw error;
        }

    }

    return likedTweet;
}

function compressLikes(uglyLikes) {
    const compressedLikes = []
    for (const like of uglyLikes) {
        if (like.content?.entryType === "TimelineTimelineCursor") continue;

        const author = extractAuthor(like.content.itemContent.tweet_results);
        const likedTweet = extractLikedTweet(like);

        if (likedTweet) {
            compressedLikes.push(likedTweet);
        }

        if (author && !seenAuthors.has(author.rest_id)) {
            authorData[author.rest_id] = author;
            seenAuthors.add(author.rest_id);
        }
    }

    return compressedLikes;
}


function MonkeyPatchedXMLHttpRequest() {
    const xhr = new originalXMLHttpRequest();
    let requestHeaders = {};
    let url = '';

    const originalOpen = xhr.open;
    xhr.open = function (method, requestUrl, ...rest) {
        url = requestUrl;
        originalOpen.call(xhr, method, url, ...rest);
    };

    const originalSetRequestHeader = xhr.setRequestHeader;
    xhr.setRequestHeader = function (header, value) {
        requestHeaders[header] = value;
        originalSetRequestHeader.call(xhr, header, value);
    };

    const originalSend = xhr.send;
    xhr.send = async function (...args) {
        if (url.includes("Likes?")) {
            console.log("Found likes request");

            window.XMLHttpRequest = originalXMLHttpRequest;

            const urlParams = new URLSearchParams(url.split("?")[1]);
            const oldVariables = JSON.parse(urlParams.get("variables"));

            const createUrlWithVariables = (baseUrl, variables) => {
                urlParams.set("variables", JSON.stringify(variables));
                return `${baseUrl}?${urlParams.toString()}`;
            };

            const fetchTweets = async (url) => {
                const response = await fetch(new Request(url, { headers: requestHeaders }));
                return response.json();
            };

            const baseUrl = url.split("?")[0];
            const initialVariables = { ...oldVariables, count: 1000 }; // the limit is "around" 100 but troll
            const initialUrl = createUrlWithVariables(baseUrl, initialVariables);

            const initialJson = await fetchTweets(initialUrl);
            const initialEntries = initialJson.data.user.result.timeline_v2.timeline.instructions[0].entries;

            let cursor = initialEntries[initialEntries.length - 1]?.content.value;
            let prevCursor = null;

            tweets.push(...compressLikes(initialEntries));

            while (cursor !== prevCursor) {
                const newCursorVariables = { ...initialVariables, cursor };
                const currentUrl = createUrlWithVariables(baseUrl, newCursorVariables);
                const currentJson = await fetchTweets(currentUrl);
                const currentEntries = currentJson.data.user.result.timeline_v2.timeline.instructions[0].entries;

                tweets.push(...compressLikes(currentEntries));
                prevCursor = cursor;
                cursor = currentEntries[currentEntries.length - 1].content.value;
                console.log(`Got ${tweets.length} tweets - cursor: ${cursor}`);
            }
            const likedTweetData = {
                tweets,
                authors: authorData
            };
            const blob = new Blob([JSON.stringify(likedTweetData, null)], { type: 'application/json' });
            const urlBlob = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlBlob;
            a.download = 'liked_tweets.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(urlBlob);
        } else {
            originalSend.apply(xhr, args);
        }
    };

    return xhr;
}

window.XMLHttpRequest = MonkeyPatchedXMLHttpRequest;
