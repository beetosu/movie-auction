/*eslint-disable no-unused-vars, no-undef, no-shadow-global*/

//hi if ur a TA tasked with checking my code, im sorry in advance, spaghetti code inbound
var cursors, revenue, mData, paddle, tweeTime, timer, delay, beginTimer, auctionStats, countdown, oldScore, winnerIndex, names, available, oneName, twoName, threeName, fourName, namePlace, startAuction, roundBids, data, auctionDialog, twee;
var bid = 5;
var addBid = 100;
var topBids = [];
var prefix = ["1st", "2nd", "3rd", "4th"];
var scoreboard = [];
var players = [{name: "Player 1", score: 0}, {name: "Player 2", score: 0}, {name: "Player 1", score: 0}, {name: "Player 4", score: 0}];
var paddleX = [130, 670, 310, 490];
var bidStructure = [{cap: 50, start: 5, bid: 12}, {cap: 100, start: 5, bid: 20}, {cap: 200, start: 10, bid: 40}, {cap: 400, start: 50, bid: 80}, {cap: 1000, start: 100, bid: 200}, {cap: 99999, start: 500, bid: 400}];
var topBidder = "-----------";
var leaderboard = [];
var auctionOver = false;
var nextRound = false;
var endDelay = false;
var noBids = false;
var endTwee = false;
var endNY = false;
var post =  0;
var seconds = 300;

//gets the api data from the python and returns an array with revenue, budget, name, and year of release
function python() {
    var xhr = new XMLHttpRequest(),
    method = "GET",
    url = "/movies";

    xhr.open(method, url, true);
    xhr.onreadystatechange = function () {
      if(xhr.readyState === 4) {
        movies = xhr.responseText;
      }
    };
    xhr.send();
}

//takes the top bid data collected and combines it with api data to make graph
function map() {
    Plotly.setPlotConfig({ mapboxAccessToken: 'pk.eyJ1IjoiY3B3YWxzaCIsImEiOiJjam5jNHIzemUwYXJrM3VwbHNseHR2czlwIn0.2k4sHdKIrHoQuuRsc2s6fQ' });
        
    data = [];
    
    for (var v = 0; v <= post; v++) {
        data.push({});
        data[v].x = ["budget"];
        for (var t = 0; t < players.length; t++) {
            data[v].x.push(players[t].name);
        }
        data[v].x.push("revenue");
        data[v].y = [mData[v].budget];
        for (var h = 0; h < topBids[v].length; h++) {
            data[v].y.push(topBids[v][h]);
        }
        data[v].y.push(mData[v].revenue);
        data[v].type = "bar";
        data[v].name = mData[v].title;
    }
  
    Plotly.newPlot('map', data);
}

//makes the paddle movement tween stop
function paddleDown() { endTwee = true; }

//calculates the actual act of bidding
function postBid() {
    bid += addBid;
    paddle.setFrame(winnerIndex);
    paddle.x = paddleX[winnerIndex];
    twee.resume();
    topBidder = players[winnerIndex].name;
    seconds = 6;
    topBids[topBids.length - 1][winnerIndex] = bid;
    countdown.setText(String(seconds));
    noBids = true;
    beginTimer = true;
    auctionDialog.setText([String(bid + addBid), "million?"]);
}

//moves the editable name down in the lobby name creation section
function decreaseNP() {
    if (namePlace === 2) {
        twoName.alpha = 1;
        twoName.setText(names.text);
        oneName.alpha = 0;
        names.setText(oneName.text);
        names.y = oneName.y;
    }
    else if (namePlace === 3) {
        threeName.alpha = 1;
        if (namePlace <= players.length) { threeName.setText(names.text); }
        twoName.alpha = 0;
        names.setText(twoName.text);
        names.y = twoName.y;
    }
    else if (namePlace === 4) {
        fourName.alpha = 1;
        if (namePlace <= players.length) { fourName.setText(names.text); }
        threeName.alpha = 0;
        names.setText(threeName.text);
        names.y = threeName.y;
    }
    namePlace -= 1;
}

//makes the auction run for exactly 6 seconds after the last bid
function clock() {
    countdown.setText(String(seconds));
    if (seconds <= 0) {
        countdown.alpha = 0;
        timer.remove(false);
        auctionOver = true;
        console.log("bidder: " + topBidder);
        console.log("top bid: " + "$" + bid + "M");
    }
    else {
        seconds--;
        if (seconds === 0) { countdown.setText("SOLD!"); countdown.alpha = 1; }
        else { countdown.setText(String(seconds)); }
        if (seconds <= 3 && seconds !== 0) { newyear.resume(); countdown.alpha = 1; }
        console.log("seconds remaining: " + String(seconds));
    }
}

function leaderboardSort(x, y) {
    if (x.score > y.score) { return -1; }
    else if (y.score > x.score) { return 1; }
    return 0;
}

//subtracts bid from film revenue and gives that to the top bidder
function calculateAuction() {
    oldScore = players[winnerIndex].score;
    players[winnerIndex].score += mData[post].revenue - bid;
}

//stops the timer set to stop bid spam
function buffer() {
    endDelay = true;
}

//finds the appropiate bidding increments / starting bids for each film based on revenue / party size
function findBid() {
    for (var i = 0; i < bidStructure.length; i++) {
        if (mData[post].revenue < bidStructure[i].cap) {
            bid = bidStructure[i].start;
            addBid = Math.round(bidStructure[i].bid / players.length);
            break;
        }
    }
}

//makes a blank array for each players top bids to go into each round
function appendTopBids() {
    roundBids = [];
    for (var o = 0; o < players.length; o++) {
        roundBids.push(0);
    }
    topBids.push(roundBids);
}

//first scene, where the amount of players / the player names are picked and api data is fetched for later
var lobby = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function lobby ()
    {
        Phaser.Scene.call(this, { key: 'lobby' });
    },

    preload: function ()
    {
        //gets api data and creates an image object for each film poster
        python();
        for (var i = 0; i < 5; i++) {
            this.load.image('poster ' + String(i), "assets/posters/poster"+ String(i) + ".jpg");
        }
        this.load.image('end', 'boy.jpg');
    },

    create: function () {
        mData = JSON.parse(movies);
        cursors = this.input.keyboard.createCursorKeys();
        available = ['Player 1:','Player 2:'];
        titles = this.add.text(150, 200, available, {fontFamily: 'Black Han Sans', fontSize: 30, lineSpacing: 18});
        names = this.add.text(300, 200, '', {fontFamily: 'Black Han Sans', fontSize: 30});
        oneName = this.add.text(300, 200, '', {fontFamily: 'Black Han Sans', fontSize: 30});
        twoName = this.add.text(300, 250, '', {fontFamily: 'Black Han Sans', fontSize: 30});
        threeName = this.add.text(300, 300, '', {fontFamily: 'Black Han Sans', fontSize: 30});
        fourName = this.add.text(300, 350, '', {fontFamily: 'Black Han Sans', fontSize: 30});
        controls = this.add.text(550, 200, ['CONTROLS','PLAYER 1 BID: Q', 'PLAYER 2 BID: P', 'PLAYER 3 BID: Z', 'PLAYER 4 BID: M'], {fontFamily: 'Black Han Sans', align: 'center', fontSize: 24});
        oneName.alpha = 0;
        namePlace = 1;
        this.add.text(400, 100, 'Box Office Auction', {fontFamily: 'Black Han Sans', fontSize: 48}).setOrigin(.5, .5);
        
        this.input.keyboard.on('keydown', function (event) {
        //delete button, removes the top character from selected player name
        if (event.keyCode === 8 && names.text.length > 0)
        {
            names.text =  names.text.substr(0, names.text.length - 1);
        } //every other key you could put in a name, adds it to desired players name
        else if ((event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)  || (event.keyCode >= 190 && event.keyCode < 193) || (event.keyCode === 186) || (event.keyCode === 188) || (event.keyCode >= 219 && event.keyCode < 223)) && names.text.length < 10)
        {
            names.text += event.key;
        } //+ button, adds a player to the roster with the default name "Player [number]"
        else if (event.keyCode === 61 && players.length < 4) {
            available.push("Player " + String(players.length + 1) + ":");
            players.push({name: "Player " + String(players.length + 1), score: 0});
            titles.setText(available);
        } //- button, the lowest player if more than 2 players are in the lobby
        else if (event.keyCode === 173 && players.length > 2) {
            available.pop();
            if (players.length === 3) {
                threeName.setText("");
            }
            else if (players.length === 4) {
                fourName.setText("");
            }
            players.pop();
            if (namePlace > players.length) {
                decreaseNP();
            }
            titles.setText(available);
        } //down arrow, transfers the written name into the players data, replaces it with the name of the player below
        else if (event.keyCode === 40 && namePlace < players.length) {
            if (namePlace === 1) {
                oneName.alpha = 1;
                oneName.setText(names.text);
                twoName.alpha = 0;
                names.setText(twoName.text);
                names.y = twoName.y;
            }
            else if (namePlace === 2) {
                twoName.alpha = 1;
                twoName.setText(names.text);
                threeName.alpha = 0;
                names.setText(threeName.text);
                names.y = threeName.y;
            }
            else if (namePlace === 3) {
                threeName.alpha = 1;
                threeName.setText(names.text);
                fourName.alpha = 0;
                names.setText(fourName.text);
                names.y = fourName.y;
            }
            namePlace += 1;
        } //up arrow, same as down arrow but upwards
        else if (event.keyCode === 38 && namePlace > 1) {
            decreaseNP();
        } //enter key, begins game, adds the typed name to the player whose name was last edited
        else if (event.keyCode === 13 && namePlace <= players.length) {
            if ((namePlace !== 1 && oneName.text !== "") || (namePlace === 1 && names.text !== "")) {
                if (namePlace === 1) {
                    players[0].name = names.text;
                }
                else {
                    players[0].name = oneName.text;
                }
            }
            if ((namePlace !== 2 && twoName.text !== "") || (namePlace === 2 && names.text !== "")) {
                if (namePlace === 2) {
                    players[1].name = names.text;
                }
                else {
                    players[1].name = twoName.text;
                }
            }
            if (players.length >= 3 && ((namePlace !== 3 && threeName.text !== "") || (namePlace === 3 && names.text !== ""))) {
                if (namePlace === 3) {
                    players[2].name = names.text;
                }
                else {
                    players[2].name = threeName.text;
                }
            }
            if (players.length === 4 && ((namePlace !== 4 && fourName.text !== "") || (namePlace === 4 && names.text !== ""))) {
                if (namePlace === 4) {
                    players[3].name = names.text;
                }
                else {
                    players[3].name = fourName.text;
                }
            }
            startAuction = true;
        }
        console.log(event);

    });
    },

    update: function ()
    {
        //transfers from lobby to the actual game, the 'auction' state
        if (startAuction) {
            startAuction = false;
            topBidder = "-----------";
            appendTopBids();
            this.scene.start('auction');
        }
    }

});

//shows what happened during the last round / changes to player scores
var results = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function results ()
    {
        Phaser.Scene.call(this, { key: 'results' });
    },

    preload: function ()
    {
        
    },

    create: function () {
        cursors = this.input.keyboard.createCursorKeys();
        calculateAuction();
        this.add.text(400, 100, [topBidder + "'s bid: $" + String(bid) + " million", "actual revenue: $" + String(mData[post].revenue) + " million", String(oldScore) + " + " + String(mData[post].revenue) + " - " + String(bid) + " = " + String(players[winnerIndex].score)], {color: "#FFFFFF", fontFamily: 'Black Han Sans', fontSize: 40}).setOrigin(.5, .5);
        for (var z = 0; z < players.length; z++) {
            leaderboard.push(players[z].name + ": " + String(players[z].score));
        }
        this.add.text(100, 300, leaderboard, {fontFamily: 'Black Han Sans', fontSize: 30});
        leaderboard = [];
        this.input.keyboard.on('keydown', function (event) {
            if ( event.keyCode === 13 ) {
                nextRound = true;
            }
        });
    },

    update: function ()
    {
        if (nextRound) {
            nextRound = false;
            if (post < 3) {
                    post++;
                    seconds = 300;
                    appendTopBids();
                    topBidder = "-----------";
                    winnerIndex = 12;
                    this.scene.start('auction');
            }
            else {
                this.scene.start('ending');
            }
        }
    }

});

//the meat and potatoes, the actual 'game' part
var auction = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function auction ()
    {
        Phaser.Scene.call(this, { key: 'auction' });
    },

    preload: function ()
    {
        this.load.image('stage', 'assets/roughstage.png');
        this.load.spritesheet('paddles', 'assets/paddles.png', {frameHeight: 200, frameWidth: 150, first: 0});
        this.load.image('cowboy', 'assets/cowboy.png');
        this.load.image('bubble', 'assets/bubble.png');
    },

    create: function () {
        this.add.sprite(400, 300, 'stage');
        cursors = this.input.keyboard.createCursorKeys();
        auctionOver = false;
        this.poster = this.add.sprite(300, 250, 'poster ' + String(post));
        this.add.sprite(450, 250, 'cowboy');
        findBid();
        this.poster.displayWidth = 150;
        this.poster.scaleY = this.poster.scaleX;
        timer = this.time.addEvent({ delay: 1000, callback: clock, loop: true, timeScale: 1.0 });
        console.log("revenue: " + String(mData[post].revenue) + " million");
        paddle = this.add.sprite(100, 700, 'paddles', 0);
        this.add.sprite(600, 150, 'bubble');
        auctionDialog = this.add.text(600, 150, [String(bid + addBid), "million?"], {color: "#000000", fontFamily: "Black Han Sans", fontSize: 48, align: 'center'}).setOrigin(.5, .5); 
        countdown = this.add.text(400, 300, String(seconds), {fontFamily: 'Black Han Sans', fontSize: 96, align: 'right'}).setOrigin(.5, .5);
        this.add.text(400, 400, [String(mData[post].title), "(" + String(mData[post].year) + ")"], {color: "#000000", align: 'center', fontFamily: 'Black Han Sans', fontSize: 24}).setOrigin(.5, .5);
        countdown.setStroke('#000000', 8);
        countdown.alpha = 0;
        
        //the tween for the auction paddles each player controls
        twee = this.tweens.add({
                    targets: paddle,
                    y: 500,
                    ease: 'Power2',
                    duration: 250,
                    yoyo: true,
                    repeat: 99999,
                    timeScale: 1,
                    paused: true,
                    onRepeat: function () { endTwee = true; },
                });
        
        //the tween for the text counting down the final seconds of the auction
        newyear = this.tweens.add({
            targets: countdown,
            alpha: 0,
            ease: 'Power1',
            duration: 500,
            repeat: 999999,
            timeScale: 1,
            paused: true,
            onRepeat: function () { endNY = true; }
        });
        
        this.input.keyboard.on('keydown', function (event) {
            //each player's inputs to request a bid
            if (event.keyCode === 81 && winnerIndex !== 0 && noBids === false) {
                winnerIndex = 0;
                postBid();
            }
            else if (event.keyCode === 80 && winnerIndex !== 1 && noBids === false) {
                winnerIndex = 1;
                postBid();
            }
            else if (event.keyCode === 90 && winnerIndex !== 2 && noBids === false && players.length >= 3) {
                winnerIndex = 2;
                postBid();
            }
            else if (event.keyCode === 77 && winnerIndex !== 3 && noBids === false && players.length === 4) {
                winnerIndex = 3;
                postBid();
            }
        });
    },

    update: function ()
    {
           
        if (auctionOver) {
            this.scene.start("results");
        }
        
        if (endDelay) {
            endDelay = false;
            noBids = false;
        }
        
        if (beginTimer) {
            delay = this.time.addEvent({delay: 500, callback: buffer, timeScale: 1.0});
            beginTimer = false;
        }
        
        if (endTwee) {
            twee.pause();
            endTwee = false;
        }
        
        if (endNY) {
            newyear.pause();
            endNY = false;
        }
    }

});

var ending = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function ending ()
    {
        Phaser.Scene.call(this, { key: 'ending' });
    },

    preload: function ()
    {
        map();
        //this.load.image('end', 'boy.jpg');
    },

    create: function () {
        players.sort(leaderboardSort);
        for (var g = 0; g < players.length; g++) {
            scoreboard.push(prefix[g] + ": " + players[g].name + " (" + String(players[g].score) + ")");
        }
        this.add.text(400, 300, scoreboard, {fontFamily: 'Black Han Sans', fontSize: 30}).setOrigin(.5, .5);
        this.add.text(400, 100, "FINAL RESULTS", {fontFamily: 'Black Han Sans', fontSize: 48}).setOrigin(.5, .5);
        console.log(data[1].x);
        console.log(data[1].y);
        console.log(topBids);
    },

    update: function ()
    {
        
    }

});

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#c60305',
    parent: "game",
    scene: [ lobby, auction, results, ending ]
};

var game = new Phaser.Game(config);