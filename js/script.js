
$(function(){

    //This is only for storing static and dynamic UI Elements
    const UIController = (() => {
        
        //Add static UI Elements here
        const DOMElements = {
            window : $(window),
            documentEle : $(document),
            document : document,
            bodyEle : $('body'),

            // Page blocks
            gameEle : $('.game'),
            resultEle : $('.statistics'),

            // Buttons
            allButtons : $('button'),
            playBtn : $('.play-btn'),
            mainMenuBtn : $('.main-menu-btn'),
            gameStatsBtn : $('.stats-btn'),
            fullscreenBtn : $('.full-screen-btn'),

            // game elements
            gameArena : $('.game-arena'),
            enemiesContainer : $('.game .enemies'),
            heroEle : $('.hero'),

            // Statstics & Audio elements
            scoreEle: $('.score'),
            gamesPlayed : $('.statistics .games-played'),
            highScore : $('.statistics .highest-score'),
            tapSound : $('#correct-wrong-color-sound')[0],
            bgMusic : $('#bg-music')[0],
            gamePlayMusic : $('#game-music')[0],
            buttonClickSound : $('#button-click-sound')[0],
            volumeControls : $('.volume-controls img'),

            //Dynamically added UI Elements should be handled as functions
            audioControl : function(dataset) {
                return $(`audio[data-link=${dataset}]`);
            },
            difficultySelect : function(dataset) {
                return $('input[name="difficulty"][type="radio"]:checked')[0];
            }
        };

        // Return the DOMElements object to be used by controller function
        return {
            getDOMElements : () => DOMElements
        }
    })();

    // This is only for UI manipulation
    const gameController = (() => {
        return {

            // This will add html content to the element passed
            addContent : function (ele, content) {
                ele.html(content);
                return this;
            },

            // Empty the content for element passed
            emptyEle : function (ele) {
                ele.html('');
                return this;
            },

            //Add or remove the class for ele element. If there is no class to add, pass "addcls" as false
            addRemoveCls : function (ele, addcls, removecls){
                addcls && $(ele).addClass(addcls);
                removecls && $(ele).removeClass(removecls);
                return this;
            },

            // Change attribute value for an element
            attrChange : function (ele, atrname, atrval) {
                $(ele).attr(atrname, atrval);
                return this;
            },

            // Returns parent/s element for an element
            returnParent : function (ele, data) {
                if(data) {
                    return $(ele.parents(`.${data}`));
                }
                return $(ele.parent());
            },

            // Returns parent/s sibling element for an element
            returnParentSibling : function (ele, parent, sibling) {
                if(parent && sibling) {
                    return $(ele.parents(`.${parent}`).siblings(`.${sibling}`));
                }
            },

            // Add passed css json object for the element
            addCSS : function (ele, css) {
                const cssObj = JSON.parse(css);
                ele.css(cssObj);
                return this;
            },

            // Remove an element from DOM
            removeEle : function (ele) {
                ele.remove();
                return this;
            },

            // append html content
            appendHTML : function (ele, content) {
                ele.append(content);
                return this;
            },
            // prepend html content
            prependHTML : function (ele, content) {
                ele.prepend(content);
                return this;
            },
        }
    })();

    // GLOBAL APP CONTROLLER
    const controller = ((gameCtrl, UICtrl) => {

        // Storing DOM elements
        const DOM = UICtrl.getDOMElements();

        // Setting initial values for gameObj, which will be created by gameObject class, once game is started
        const gameObj = {
            start : null,
            score : 0,
            gameSpeed : 3000,
            gamesPlayedLocalStorage : function(key) {
                localStorage && localStorage[key] ? localStorage[key] = +localStorage[key]+1 : localStorage[key] = 1;
            },
            highScoreLocalStorage : function(key, score) {
                localStorage && localStorage[key] ? localStorage[key] < score ? localStorage[key] = score : null  : localStorage[key] = score;
            }
        };

        // game object class
        class gameObject {
            constructor() {
                
                // Random Number Generator for left/right enemy 0-left 1-right
                this.randomGenerator = function () {
                    return (Math.round(Math.random()));
                }

                // This method adds enemies to the Enemy Array
                this.ememyArray = function(){
                    
                }
            }
        }

        // This functions is for all User interactions events
        const setupEvents = () => {
            
            // This is for the kick sound
            const tapSound = function(wrong){
                if(wrong === true){
                    gameCtrl.attrChange(DOM.tapSound,'src', DOM.tapSound.dataset.wrong);
                }
                if(DOM.tapSound.duration > 0 && !DOM.tapSound.paused){
                    DOM.tapSound.pause();
                    DOM.tapSound.currentTime = 0;
                    DOM.tapSound.play();
                }
                else{
                    DOM.tapSound.play();
                }
            }

            const switchMusic = function(stopMusic, playMusic){
                stopMusic.pause();
                stopMusic.currentTime = 0;
                playMusic.play();
            }

            // This will reset all the values to beginning values
            const resetGame = function() {
                //switchMusic(DOM.gamePlayMusic, DOM.bgMusic);
                DOM.bgMusic.play();
                gameObj.highScoreLocalStorage("whiteBlackHighScore", gameObj.score);

                // Setting back the gameObj to original values
                gameObj.start = null;
                gameObj.score = 0;

                if(DOM.gameEle.is(':visible')){
                    gameCtrl.addRemoveCls(DOM.gameEle,'d-none','d-block')
                            .addRemoveCls(DOM.resultEle,'d-block','d-none');
                }
                
                gameCtrl.addContent(DOM.gamesPlayed, localStorage['whiteBlackGamesPlayed'])
                        .addContent(DOM.highScore, localStorage['whiteBlackHighScore'])
                        .addContent(DOM.enemiesContainer, '')
                        .attrChange(DOM.tapSound, 'src', DOM.tapSound.dataset.correct)
                        .attrChange(DOM.heroEle, 'data-color', 'white');

                $('.statistics button:eq(0)').focus();
            }
            
            // Force landscape mode
            DOM.fullscreenBtn.on('click',function(){
                let de = DOM.document.documentElement;
                if(this.dataset.fullscreen === 'off'){
                    if(de.requestFullscreen){
                        de.requestFullscreen();
                    }
                    else if(de.mozRequestFullscreen){de.mozRequestFullscreen();}
                    else if(de.webkitRequestFullscreen){de.webkitRequestFullscreen();}
                    else if(de.msRequestFullscreen){de.msRequestFullscreen();}
                    screen.orientation.lock('landscape');
                    gameCtrl.attrChange($(this),'data-fullscreen','on');
                    gameCtrl.addContent($(this),'Exit Full Screen');
                }
                else {
                    screen.orientation.unlock();
                    if(DOM.document.fullscreen){
                        DOM.document.exitFullscreen();
                    }
                    gameCtrl.attrChange($(this),'data-fullscreen','off');
                    gameCtrl.addContent($(this),'Full Screen');
                }
                
            });

            // Unmute the volume when game is active
            DOM.window.focus(function(){
                DOM.audioControl('music').each(function(){
                    if(this.dataset.status === 'on'){
                        this.muted = false;
                    }
                });
            });
            // Mute the volume when game is inactive
            DOM.window.blur(function(){
                DOM.audioControl('music').each(function(){
                    this.muted = true;
                });
            });

            // Hide current page and show specific page for all buttons
            DOM.allButtons.on('click', function(event) {
                event.preventDefault();
                DOM.buttonClickSound.currentTime = 0;
                DOM.buttonClickSound.play();
                DOM.bgMusic.play();
                
                
                if( this.dataset.parent && this.dataset.show ) {
                    gameCtrl.addRemoveCls(gameCtrl.returnParentSibling($(this), this.dataset.parent, this.dataset.show), 'd-block', 'd-none')
                            .addRemoveCls(gameCtrl.returnParent($(this), this.dataset.parent), 'd-none', 'd-block');
                    $(`.${this.dataset.show} button:eq(0)`).focus();
                }
                
            });

            // Music & Sound controls
            DOM.volumeControls.on('click', function(){
                DOM.audioControl(this.dataset.link).each(function(){
                    if(this.dataset.status === 'on'){
                        this.muted = true;
                        this.dataset.status = 'off';
                    }
                    else{
                        this.muted = false;
                        this.dataset.status = 'on';
                    }
                });
                if(this.dataset.status === 'on'){
                    gameCtrl.attrChange($(this)[0],'src',this.dataset.off);
                    this.dataset.status = 'off';
                }
                else{
                    gameCtrl.attrChange($(this)[0],'src',this.dataset.on);
                    this.dataset.status = 'on';
                }
            });

            // Start the Game everytime Play button is clicked
            DOM.playBtn.on('click', function(event){
                //switchMusic(DOM.bgMusic, DOM.gamePlayMusic);
                DOM.bgMusic.pause();
                DOM.bgMusic.currentTime = 0;
                gameObj.start = gameObj.start || new gameObject();
                gameObj.gamesPlayedLocalStorage('whiteBlackGamesPlayed');
                DOM.scoreEle.text(gameObj.score);
                
                let incoming = setInterval(function(){
                    let color = ["black","white"];
                    let randomLeftPosition = Math.round(Math.random()*10);
                    let heroPosition = DOM.heroEle[0].getBoundingClientRect();
                    
                    let ball = `<div class="ball position-fixed" data-left="${randomLeftPosition}" data-color="${color[Math.round(Math.random())]}"></div>`;
                    $(ball).appendTo('.game .enemies').animate({
                      'bottom':'50px',
                      'left' : heroPosition.left
                    },1000,  function(){
                    let ballPosition = $('.ball')[0].getBoundingClientRect();
                    
                    
                    if(ballPosition.right >= heroPosition.left && 
                       ballPosition.left <=  heroPosition.right && 
                       ballPosition.top <= heroPosition.bottom && 
                       ballPosition.bottom >= heroPosition.top ){
                      if(DOM.heroEle.attr('data-color') === $(this).attr('data-color')){
                        tapSound();
                        gameObj.score++;
                        gameCtrl.addContent(DOM.scoreEle, gameObj.score);
                      }
                      else{
                        tapSound(true);
                        clearInterval(incoming);
                        setTimeout(() => {
                            resetGame();
                        },400);
                      }
                    }
                    $(this).remove();
                  });
                },500);
                
                DOM.documentEle.on('keypress click touchstart touchend', function(event){
                    let eventType = event.type;
                    if(eventType === 'click' && event.target.nodeName === "BUTTON") return false;
                    if((event.type === 'touchstart' && event.type === 'touchend') || eventType === 'click' || (eventType === 'keypress' && (event.originalEvent.code === 'Space' || event.code === 'Space' || event.originalEvent.code === 'Enter' || event.code === 'Enter'))){
                        let heroColor = DOM.heroEle.attr('data-color');
                        if(heroColor === "white"){
                            gameCtrl.attrChange(DOM.heroEle, 'data-color','black');
                        }
                        else {
                            gameCtrl.attrChange(DOM.heroEle, 'data-color','white');
                        }
                    }
                });
            })
            
            // This will end game and return to main menu
            DOM.mainMenuBtn.on('click', function() {
                resetGame();
            });

            //Updating game statstics in page
             DOM.gameStatsBtn.on('click', () => {
                gameCtrl.addContent(DOM.gamesPlayed, localStorage['whiteBlackGamesPlayed'])
                        .addContent(DOM.highScore, localStorage['whiteBlackHighScore']);
            }); 
        };
        
        // returning only init function
        return {
            init: () => {
                console.info('Welcome to %cWHITE BLACK GAME', "color: yellow; font-weight: bold; background-color: blue;padding: 2px");
                setupEvents();
            }
        }
    })(gameController, UIController);

    // init function triggers setupEvents, which has events functions.
    controller.init();

});
