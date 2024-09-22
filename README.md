# mytwitterlikes

I like a lot a of art tweets, and sometimes i want to go back to them, but i can't find them. So i decided to make a simplish script and web page to show and search them.

## how

Firstly you need to generate a json for the website to use.

1. Go to twitter and open developer tools (F12)
2. Go to your likes page
3. Go to the network tab
4. Filter by `Likes?`
5. Right click on the request and copy as cURL (bash)
6. go [here](https://curlconverter.com/javascript/) and convert the cURL to javascript
7. Copy it and paste over the comment inside the `makeajson.js` file

   Like the comment says replace the `fetch` with `new Request`

8. Run the script with `node makeajson.js`
9. You will now (hopefully) have a `minified_likes.json` file
10. You can now either run the website or use my [website](https://xitterlikes.masterjoona.dev)

> [!NOTE]
> Everything happens on client, you can be sure that i can't see your likes

> [!NOTE]
> Seemingly this endpoint doesn't have much of a rate limit
> I did hit it once when i accidentally looped the same request

> [!TIP]
> To get around 15k likes took me around 4 minutes

## notes

- you can't see media of quoted tweets since their data is not in the response
- you might see tweets that says `liked: no` but this is just twitter insanity
- use the search bar instead of ctrl+f since the tweets are lazy loaded

## dev

`pnpm i && pnpm run dev`

you probably know the rest
