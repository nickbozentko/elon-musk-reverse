const Twitter = require('twitter');
require('dotenv').config();

let {
    consumer_key,
    consumer_secret,
    access_token_key,
    access_token_secret,
    bearer
} = process.env;

let clientConfig = {
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    access_token_key: access_token_key,
    access_token_secret: access_token_secret,
    bearer: bearer
}

let client = new Twitter(clientConfig);
let elon = '44196397';

let stream = client.stream('statuses/filter', { follow: elon, tweet_mode: 'extended' });

stream.on('data', event => {
    if(
        event.user.id.toString() === elon // Tweet is from Elon
        && !event.retweeted_status // Is an original tweet (not a retweet)
        && !event.in_reply_to_status_id // Is not a reply tweet
    ) {
        console.log(event);

        let tweetOptions = {};

        if(!event.truncated) {
            tweetOptions.status = event.text.split('').reverse().join('');
        } else if (!event.extended_tweet.display_text_range) {
            let firstCharIdx = event.extended_tweet.display_text_range[0];
            let lastCharIdx = event.extended_tweet.display_text_range[1];
            tweetOptions.status = event.extended_tweet.full_text.substring(firstCharIdx, lastCharIdx).split('').reverse().join('');
        } else {
            tweetOptions.status = event.extended_tweet.full_text.split('').reverse().join('');
    }

        console.log('POSTING TWEET');
        console.log(tweetOptions);

        client.post('statuses/update', tweetOptions, (error, tweet) => {
            if(error) {
                console.log('Error sending tweet');
                console.log(error);
            } else {
                console.log('Tweet successfully sent');
                console.log(tweet);
            }
        });

    } 
    else {
        //console.log(event);
        console.log('Got an unrelated tweet. ' + new Date().toString());
    }
});

stream.on('error', error => {
    console.log(error);
});

stream.on('disconnect', msg => {
    console.log(msg);
    stream.start();
})