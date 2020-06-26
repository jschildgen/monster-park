lang_de = {
    "Game Instructions": "Spielanleitung",
    "Restart Game": "Spiel neustarten",
    "Change Language": "Sprache wechseln",
    "Watch Game-Trailer Video": "Game-Trailer-Video anschauen",
    "Info": "Info",
    "Attribute Name:": "Attribut-Name:",
    "Entity-type Name:": "Entitätstyp-Name:",
    "Relationship Name:": "Beziehungs-Name:",
    "is-a:": "is-a",
    "Entity Type 1:": "Entitätstyp 1:",
    "Entity Type 2:": "Entitätstyp 2:",
    "Primary Key": "Primärschlüssel",
    "Multi-valued": "Mehrwertig",
    "Sub-Attribute": "Sub-Attribut",
    "Attribute": "Attribut",
    "Entity Type": "Entitätstyp",
    "Relationship": "Beziehung",
    "Are you sure?": "Bist du dir sicher?",
    "When you restart the game, you have to start all over again.": "Wenn du das Spiel neustartest, fängst du wieder ganz von vorne an.",
    "Yes, restart!": "Ja, Neustart!",
    "No, continue the game!": "Nein, weiterspielen!",
    "Please choose your language.": "Bitte wähle eine Sprache.",
    "Afterwards, you can continue your game without restarting.": "Danach kannst du das Spiel ganz normal weiterspielen, ohne es neu starten zu müssen.",
    "A learning game for entity-relationship diagrams": "Ein Lernspiel für Entity-Relationship-Diagramme",
    "%game_info": "Das Spiel wurde an der OTH Regensburg von Prof. Dr. Johannes Schildgen entwickelt. Ein großer Dank geht an Isabell Ruth, die die Grafiken erstellt hat!",
    "Next": "Weiter",
    "Previous": "Zurück",
    "This is you!": "Das bist du!",
    "%joyride_info_player": "Deine Aufgabe ist es, ein Entity-Relationship-Diagramm für den Freizeit-Park \"MonstER Park\" zu erstellen.",
    "%joyride_info_control": "Über diese Buttons erstellst du neue Entitätstypen, Beziehungen und auch Attribute. Später findest du in dieser Leiste noch weitere Steuerelemente.",
    "%joyride_info_area": "Hier entsteht dein ER-Diagramm. Du kannst Elemente verschieben und auswählen. Wenn du ein ausgewähltes Element löschen willst, siehst du unten links einen Papierkorb-Knopf. Du kannst aber auch einfach die Entf-Taste auf der Tastatur drücken.",
    "%joyride_info_menu": "Über dieses Menü hast du ja schon die Spielanleitung geöffnet. Dort kannst du auch die Sprache ändern oder das Spiel neustarten.",
    "%joyride_info_go": "Jetzt bist du dran! Probiere einfach alles aus. Wenn du eine Aufgabe gelöst hast, geht das Spiel von selbst weiter. Wenn du jedoch einen roten Weiter-Knopf siehst, musst du den zuerst drücken. Viel Spaß beim MonstER-Park-Lernspiel!"

}

lang_en = {
    "%game_info": "The game was developed at the University of Applied Sciences in Regensburg, Germany by Prof. Dr. Johannes Schildgen. Special thanks go to Isabell Ruth for creating the images!",
    "%joyride_info_player": "It's your job to create an entity-relationship diagram for the theme park \"MonstER Park\".",
    "%joyride_info_control": "Use this button to create new entity types, relationships, and also attributes. Later, you'll find more control elements here.",
    "%joyride_info_area": "This is where your ER diagram appears. You can drag and drop items and select them. When you want to delete the element that you've selected, you can press the paper-bin button that will appear on the bottom left. But you can also simply press the Delete key on your keyboard.",
    "%joyride_info_menu": "You already used this menu to open the manual. Here you can also change the language or restart the game.",
    "%joyride_info_go": "Now it's your turn! Simply try out all features. When you've solved an exercise, the game will automatically continue. But when you see a red Continue button, you have to press that button first. Have fun with MonstER Park!"
}

change_language(window.navigator.language.slice(0, 2));

function change_language(language_code) {
    if(language_code == "de") {
        lang = lang_de;
    } else {
        lang = lang_en;
    }

    $('.lang').each(function(e) {
        if($(this).prop("data-lang") != undefined) {
            this.innerHTML = translate($(this).prop("data-lang"));
            return;
        }
        $(this).prop("data-lang", this.innerHTML);
        this.innerHTML = translate(this.innerHTML);
    });
}


function translate(txt) {
    if(lang[txt] == undefined) {
        if(window.navigator.language.slice(0, 2) != "en" || txt.slice(0,1) == "%") {
            console.log('"' + txt + '": "", ');
        }
        return txt;
    }
    return lang[txt];
}