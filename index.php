<?php
session_start();
session_destroy();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="icon" href="./favicon.ico">
    <title>MonstER Park</title>
    <link rel="stylesheet" href="css/foundation.min.css">
    <link rel="stylesheet" href="css/animation.min.css">
    <link rel="stylesheet" href="css/joint.min.css">
    <link rel="stylesheet" href="css/app.css">
    <link rel="stylesheet" href="css/fontawesome.min.css">

    <!-- Matomo -->
    <script type="text/javascript">
        var _paq = window._paq || [];
        /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
            var u="https://analytics.t63.de/";
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', '6']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
        })();
    </script>
    <noscript><p><img src="https://analytics.t63.de/matomo.php?idsite=6&amp;rec=1" style="border:0;" alt="" /></p></noscript>
    <!-- End Matomo Code -->
</head>
<body>

<div class="ribbon clearfix hide-on-phones">
    <div class="left">&nbsp;</div>
    <a href="" class="menu-button red button" id="menu-button"></a>
    <div class="title"><h1>MonstER Park</h1></div>
    <div class="right">&nbsp;</div>
    <div class="logo"><img src="images/oth.png" width="179" height="94" alt="SQL Island" ></div>
</div>

<div class="row show-on-phones">
    <div class="columns twelve phone-logobar"><img src="images/oth.png" alt="MonstER Park" width="120"></div>
    <div class="columns twelve phone-titlebar"><h1>MonstER Park</h1></div>
    <a href="" class="menu-button button red mobile"></a>
</div>

<div class="menu-content">
    <ul class="menu">
        <li><a href="#" class="medium red button radius lang" id="joyride-button">Game Instructions</a></li>
        <li><a href="#" onClick="$('#restart-modal').foundation('reveal', 'open');" class="medium red button radius lang" id="restart-button">Restart Game</a></li>
        <li><a href="#" onClick="$('#language-modal').foundation('reveal', 'open');" class="medium red button radius lang" id="language-button">Change Language</a></li>
        <li><a id="sandbox-button" href="#" onClick="$('#sandbox-modal').foundation('reveal', 'open');" class="medium red button radius lang" id="restart-button">Sandbox Mode</a></li>
        <li><a href="#" onClick="$('#info-modal').foundation('reveal', 'open');" class="medium red button radius lang" id="info-button">Info</a></li>
    </ul>

    <span class="menu-pointer-bg clearfix"></span>
    <span class="menu-pointer clearfix"></span>
</div>
<div class="menu-bg" style="display: block; cursor: pointer; opacity: 0.4;"></div>

<ol id="joyRideContent" class="joyride-list" data-joyride>
    <li data-id="leftimg" data-options="tip_location: top; prev_button: false">
        <h4 class="lang">This is you!</h4>
        <p class="lang" style="font-size:12pt">%joyride_info_player</p>
    </li>
    <li data-id="ctrl_new_entitytype" data-options="tip_location: top">
        <p class="lang" style="font-size:12pt">%joyride_info_control</p>
    </li>
    <li data-id="erd" data-options="tip_location: left">
        <p class="lang" style="font-size:12pt">%joyride_info_area</p>
    </li>
    <li data-id="menu-button" data-options="tip_location: top">
        <p class="lang" style="font-size:12pt">%joyride_info_menu</p>
    </li>
    <li data-id="rightimg" data-options="tip_location: right">
        <p class="lang" style="font-size:12pt">%joyride_info_go</p>
    </li>
</ol>

<div id="app">
    <div id="screen-index" class="container" style="margin-top:15px;">

        <div class="row text-box-container">
            <div class="four columns" id="story">
                <div class="offset-by-one animated bounceIn" id="bubble">
                    <div class="text-box clearfix" style="width:250px">
                        <h3 id="exercise_text"></h3>
                        <a id="continue_button" class="large red button radius right lang">Continue</a>
                        <div id="certificate_form" style="display: none">
                            <label for="certificate_input_name" class="lang" style="color:white">Your Name:</label><br>
                            <input type="text" id="certificate_input_name" style="width:95%"><br>
                            <form action="cert.php" method="get" target="_blank" id="certificate_open"></form>
                            <a id="certificate_button" class="large green button radius right lang">Certificate</a>
                        </div>
                        <span class="text-box-pointer clearfix" style="left:190px;"></span> <!-- left: 20 -->
                        <span class="text-box-pointer-shadow" style="left:183px;"></span> <!-- left: 13 -->
                    </div>
                </div>

                <div class="row bg-image-container">
                    <div id="leftimg" class="one column bg-avatar animated fadeInLeft"></div>
                    <div id="rightimg" class="hide-on-phones bg-avatar2"></div>
                </div>
            </div>
            <div class="eight columns">
                <div id="erd"></div>
            </div>
        </div>



    </div>

    <!-- $("#ctrl_input_name").effect( "bounce", "slow" ); -->
    <div class="row">
        <div class="row columns twelve button disabled save-button radius" style="height: 32px; opacity: 1">
            <a id="ctrl_delete" class="red button radius" style="visibility: hidden; margin:0; position: absolute; left: 10px; padding-left: 15px; padding-right: 15px"><i class="fas fa-trash-alt"></i> </a>

            <div id="ctrl_input_name_box" class="ctrl_attribute ctrl_entitytype ctrl_relationship" style="visibility: hidden; margin-top: 0px; position: absolute; left: 63px; text-align: left;">
                <label class="ctrl_attribute lang" for="ctrl_input_name" style="display: none">Attribute Name:</label>
                <label class="ctrl_entitytype lang" for="ctrl_input_name" style="display: none">Entity-type Name:</label>
                <label class="ctrl_relationship lang" for="ctrl_input_name" style="display: none">Relationship Name:</label>
                <br><input id="ctrl_input_name" type="text" style="width: 120px; height:13px" maxlength="17"></label>
            </div>

            <div class="ctrl_entitytype" style="visibility: hidden; margin-top: 0px; position: absolute; right: 707px; text-align: left;">
                <label for="ctrl_select_e1" class="lang">is-a:</label>
                <div style="white-space: nowrap;">
                    <select id="ctrl_select_super" style="width: 105px; display: inline-block; background-color: white;"><option></option></select>
                </div>
            </div>

            <div class="ctrl_relationship" style="visibility: hidden; margin-top: 0px; position: absolute; left: 63px; text-align: left;">
                <label for="ctrl_select_e1" class="lang">Entity Type 1:</label>
                <div style="white-space: nowrap;">
                    <select id="ctrl_select_e1" style="width: 105px; display: inline-block; background-color: white;"><option></option></select><select id="ctrl_card_e1" style="width: 35px; display: inline-block; background-color: white;"></select>
                </div>
            </div>

            <div class="ctrl_relationship" style="visibility: hidden; margin-top: 0px; position: absolute; right: 558px; text-align: left;">
                <label for="ctrl_select_e2" class="lang">Entity Type 2:</label>
                <div style="white-space: nowrap;">
                    <select id="ctrl_select_e2" style="width: 105px; display: inline-block; background-color: white;"><option></option></select><select id="ctrl_card_e2" style="width: 35px; display: inline-block; background-color: white;"></select>
                </div>
            </div>

            <div class="ctrl_attribute" style="visibility: hidden; margin-top: -3px; position: absolute; left: 193px; text-align: left">
                <span class="hide_for_relationship_attributes"><input id="attr_primary" type="checkbox"><label for="attr_primary" class="lang">Primary Key</label><br></span>
                <input id="attr_mult" type="checkbox"><label for="attr_mult" class="lang">Multi-valued</label>
            </div>

            <a id="ctrl_new_subattribute" class="ctrl_attribute red button radius" style="visibility: hidden; margin:0; position: absolute; right: 555px; width:100px"><i class="fas fa-plus"></i> <span class="lang">Sub-Attribute</span></a>

            <a id="ctrl_new_attribute" class="ctrl_attribute ctrl_entitytype ctrl_relationship red button radius" style="visibility: hidden; margin:0; position: absolute; right: 375px; width:100px"><i class="fas fa-plus"></i> <span class="lang">Attribute</span></a>

            <a id="ctrl_new_entitytype" class="red button radius" style="margin:0; position: absolute; right: 195px; width:100px"><i class="fas fa-plus"></i> <span class="lang">Entity Type</span></a>

            <a id="ctrl_new_relationship" class="red button radius" style="margin:0; position: absolute; right: 15px; width:100px"><i class="fas fa-plus"></i> <span class="lang">Relationship</span></a>

        </div>
    </div>
</div>



<div id="restart-modal" class="reveal-modal tiny" data-reveal aria-labelledby="restart-modalTitle" aria-hidden="true" role="dialog">
    <h2 id="restart-modalTitle" class="lang">Restart Game</h2>
    <p class="lead lang">Are you sure?</p>
    <p class="lang">When you restart the game, you have to start all over again.</p>
    <p><a href="#" id="really-restart-button" class="button lang">Yes, restart!</a>
        <a href="#" id="not-restart-button" class="button lang">No, continue the game!</a></p>
    <a class="close-reveal-modal" aria-label="Close">&#215;</a>
</div>

<div id="sandbox-modal" class="reveal-modal tiny" data-reveal aria-labelledby="restart-modalTitle" aria-hidden="true" role="dialog">
    <h2 id="restart-modalTitle" class="lang">Sandbox Mode</h2>
    <p class="lead lang">Are you sure?</p>
    <p class="lang">Starting the sandbox mode will stop the game and allows you to freely model an ER diagram of your choice.</p>
    <p><a href="#" id="really-sandbox-button" class="button lang">Yes, start sandbox mode!</a>
        <a href="#" id="not-sandbox-button" class="button lang">No, continue the game!</a></p>
    <a class="close-reveal-modal" aria-label="Close">&#215;</a>
</div>

<div id="language-modal" class="reveal-modal tiny" data-reveal aria-labelledby="language-modalTitle" aria-hidden="true" role="dialog">
    <h2 id="language-modalTitle" class="lang">Change Language</h2>
    <p class="lead lang">Please choose your language.</p>
    <p class="lang">Afterwards, you can continue your game without restarting.</p>
    <p><a href="javascript:change_language('de');" class="button">Deutsch</a>
        <a href="javascript:change_language('en');" class="button">English</a>
        <a class="close-reveal-modal" aria-label="Close">&#215;</a>
</div>

<div id="info-modal" class="reveal-modal tiny" data-reveal aria-labelledby="modalTitle" aria-hidden="true" role="dialog">
    <h2 id="modalTitle">http://www.monst-er.de - MonstER Park</h2>
    <p class="lead lang">A learning game for entity-relationship diagrams</p>
    <p class="lang">%game_info</p>
    <p><a href="https://www.johannesschildgen.de" class="button" target="_blank">https://www.johannesschildgen.de</a></p>
    <a class="close-reveal-modal" aria-label="Close">&#215;</a>
</div>

<script type="text/javascript"  src="./js/jquery-1.11.3.min.js"></script>
<script type="text/javascript"  src="./js/jquery-ui.min.js"></script>
<script type="text/javascript"  src="./js/ace.js"></script>
<script type="text/javascript" src="./js/modernizr.foundation.js"></script>
<script type="text/javascript" src="./js/screen-common.js"></script>
<script type="text/javascript" src="./js/foundation.min.js"></script>
<script type="text/javascript" src="./js/lodash.js"></script>
<script type="text/javascript" src="./js/fireworks.js"></script>
<script type="text/javascript" src="./js/backbone.js"></script>
<script type="text/javascript" src="./js/joint.min.js"></script>
<script type="text/javascript" src="./js/erd.js"></script>
<script type="text/javascript" src="./js/game.js"></script>
<script type="text/javascript" src="./js/language.js"></script>
<script defer type="text/javascript" src="./js/html2canvas.min.js"></script>

<script type="text/javascript">
    function updateContainerSize() {
        var height = document.documentElement.clientHeight;
        $('#erd').css({'height': height-190});
        $('#erd').scrollTop($('#erd').prop('scrollHeight'));
    }

    $(window)
        .load(function() {
            updateContainerSize();
        })
        .resize(function(){
            updateContainerSize();
        });

    $(document).foundation();
    $(document).foundation({joyride: {
                pre_ride_callback: function() {
                    $('.joyride-next-tip').text(translate("Next"));
                    $('.joyride-prev-tip').text(translate("Previous"));
                    $('#bubble').hide();
                },
                post_ride_callback: function() {
                    $('#bubble').show();
                },
                abort_on_close : false,
            }});
</script>
</body>
</html>
