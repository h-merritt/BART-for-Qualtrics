//existing problems:
//1. DONE have round number, total points, and current points updated in display. i try to do this on lines 81, 145, 165
//2. DONE increase size of balloon incrementally when participant clicks pump button. trying to do this on lines 72-94
//3. save pumpsPerRound, poppedBalloons, and pointsEarnedPerRound to Qualtrics data, trying to do this on lines 58-69
//4. DONE the buttons change their size when clicked? I have no idea why? it's not a problem maybe?
//5. the mobile version looks funky, but maybe we can tell people to do it on a desktop?
//6. #there's a mysterious line under the buttons that i don't think i have in my code? I also don't like the underline
//under the text on the buttons, but that might just be a stylistic preference?

//once the page loads, do all these things
Qualtrics.SurveyEngine.addOnload(function () {
    /**
     * ******************************************************************
     * ************************** STATES ********************************
     * ******************************************************************
     */
        // round number that ppt is on
    var currentRound = 0;

    // total number of rounds
    var maxNumRounds = 30;

    // amount of points ppt has earned across rounds
    var totalPoints = 0;

    //number of points ppt has earned so far in the current round
    var currentPoints = 0;

    // number of times this round ppt has pumped up balloon
    var numberOfPumpsThisRound = 0;

    // variables for generating maximum pumps array
    var floorMaxPumps = 1;
    var ceilingMaxPumps = 32;
    var maxNumberPumps = [];

    // Balloon image variables
    var initialBalloonHeight = 30;
    var initialBalloonWidth = 30;
    const balloonSizeDelta = 5;
    var balloonIsPopped = false;

    // number of times each round that ppt pumps up balloon
    var pumpsPerRound = [];

    // records whether ppt popped the balloon in a given round;
    var poppedBalloons = [];

    // records number of pts earned per round
    var pointsEarnedPerRound = [];

    // Script housekeeping: need _this to keep track of current context for "this" so we can enable Qualtrics
    // button later
    var _this = this;

    /**
     * ******************************************************************
     * ************************** INITIAL ACTIONS ***********************
     * ******************************************************************
     */
    this.disableNextButton();
    if (currentRound === 0) {
        initUi();
        initValues();
    }

    /**
     * ******************************************************************
     * ************************** BINDINGS ******************************
     * ******************************************************************
     */

    jQuery("#pumpButton").click(function() {
        balloonIsPopped = false;
        jQuery("#messageField").text("");
        pumpUpBalloon();
        popOrNotAndCheckForEndGameOrNextRound();
    });

    jQuery("#saveButton").click(function() {
        savePoints();
    });

    jQuery("#nextRoundButton").click(function() {
        nextRound();
    });

    /**
     * ******************************************************************
     * ************************** METHODS *******************************
     * ******************************************************************
     */

    function initUi() {
        jQuery("#nextRoundButton").hide();
        initBalloonSize();
        updateUi();
    }

    function initValues() {
        for (let i = 0; i < maxNumRounds; i++) {
            maxNumberPumps.push(getRandomInt(floorMaxPumps, ceilingMaxPumps));
        }
        console.log("max pumps: " + maxNumberPumps);
    }

    function initBalloonSize() {
        jQuery("#balloon").height(initialBalloonHeight);
        jQuery("#balloon").width(initialBalloonWidth);
    }

    function updateUi() {
        jQuery("#roundNumber").text((currentRound + 1).toString());
        jQuery("#totalPoints").text(totalPoints.toString());
        jQuery("#points").text(currentPoints.toString());
    }

    function disableUi() {
        jQuery("#pumpButton").hide();
        jQuery("#saveButton").hide();
        jQuery("#nextRoundButton").hide();
    }

    function resetBalloonSize() {
        jQuery("#balloon").width(initialBalloonWidth);
        jQuery("#balloon").height(initialBalloonHeight);
    }

    function pumpUpBalloon() {
        numberOfPumpsThisRound += 1;
        currentPoints += 1;
        jQuery("#points").text(currentPoints.toString());
        increaseBalloonSize();
    }

    function increaseBalloonSize() {
        var balloonWidth = jQuery("#balloon").width();
        var balloonHeight = jQuery("#balloon").height();
        jQuery("#balloon").width(balloonWidth + balloonSizeDelta);
        jQuery("#balloon").height(balloonHeight + balloonSizeDelta);
    }

    function popOrNotAndCheckForEndGameOrNextRound() {
        if (numberOfPumpsThisRound > 1 && numberOfPumpsThisRound >= maxNumberPumps[currentRound]) {
            popBalloon();

            // Check if we should end the game or go to the next round
            if (currentRound >= maxNumRounds) {
                endGame();
            } else {
                jQuery("#messageField").text("Oh no! You popped the balloon! You lose all your points from this round. You can try again in the next round. Ready?");
                jQuery("#nextRoundButton").show();
            }
        }
    }

    function popBalloon() {
        currentPoints = 0;
        balloonIsPopped = true;
        showPoppedBalloon();
        updateUi();
        saveData();
    }

    function savePoints() {
        if (numberOfPumpsThisRound < 1) {
            jQuery("#messageField").text("Oops! You need to pump the balloon and earn points before you can save anything to the bank.");
        } else {
            totalPoints += currentPoints;
            saveData();
            jQuery("#pumpButton").hide();
            jQuery("#saveButton").hide();
            jQuery("#nextRoundButton").show();
        }
    }

    function nextRound() {
        jQuery("#messageField").text("");
        jQuery("#pumpButton").show();
        jQuery("#saveButton").show();
        jQuery("#nextRoundButton").hide();
        showNormalBalloon();
        currentRound += 1;
        if (currentRound >= maxNumRounds) {
            endGame();
        } else {
            currentPoints = 0;
            numberOfPumpsThisRound = 0;
            updateUi();
            resetBalloonSize();
        }
    }

    function endGame() {
        _this.enableNextButton();
        disableUi();
        jQuery("#messageField").text("Game over! Click the 'Next' button below to move on.");
    }

    function saveData() {
        pointsEarnedPerRound.push(currentPoints);
        pumpsPerRound.push(numberOfPumpsThisRound);
        poppedBalloons.push(balloonIsPopped);
        Qualtrics.SurveyEngine.setEmbeddedData('pointsEarnedPerRound', pointsEarnedPerRound);
        Qualtrics.SurveyEngine.setEmbeddedData('poppedBalloons', poppedBalloons);
        Qualtrics.SurveyEngine.setEmbeddedData('pumpsPerRound', pumpsPerRound);
        Qualtrics.SurveyEngine.setEmbeddedData('maxNumberPumps', maxNumberPumps);
        console.log("points per round: " + pointsEarnedPerRound);
        console.log("pumps per round: " + pumpsPerRound);
        console.log("popped balloons: " + poppedBalloons);
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function showNormalBalloon() {
        console.log("enter showNormalBalloon()");
        jQuery("#balloon").show();
        jQuery("#balloon").attr('src', "https://cornell.ca1.qualtrics.com/ControlPanel/Graphic.php?IM=IM_9HbY2o0MWFNzxkh");
    }

    function showPoppedBalloon() {
        // Play popped balloon sound
        var audio = new Audio('https://dl.dropbox.com/s/ek3swsczsurvdjz/bang%20%28online-audio-converter.com%29.mp3?dl=0');
        audio.play();

        // Show popped balloon
        var balloonElement = jQuery("#balloon");
        balloonElement.hide("explode");
        jQuery("#pumpButton").hide();
        jQuery("#saveButton").hide();
    }
});
