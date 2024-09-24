# mytwitterlikes

I like a lot a of art tweets, and sometimes i want to go back to them, but i can't find them. So i decided to make a simplish script and web page to show and search them.

## how

Firstly you need to generate a json for the website to use.

1. Go to [twitter.com](https://twitter.com) and open developer tools (F12)
2. copy and paste the script [pasteme.js](/pasteme.js) to the console and press enter
3. Now go the likes page and wait until the script finishes, it will download the json automatically
4. You will now (hopefully) have a `liked_tweets.json` file
5. You can now either run this website or use my [website](https://xitterlikes.masterjoona.dev) to view them

> [!NOTE]
> Everything happens on client, you can be sure that i can't see your likes

> [!NOTE]
> Seemingly this endpoint doesn't have much of a rate limit
> I did hit it once when i accidentally looped the same request

> [!TIP]
> To get around 15k likes took me around 4 minutes

## notes

- you might see tweets that says `liked: no` but this is just twitter insanity
- use the search bar instead of ctrl+f since the tweets are lazy loaded

## dev

`pnpm i && pnpm run dev`

you probably know the rest
