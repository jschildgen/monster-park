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
    "Entity Type": "Enitätstyp",
    "Relationship": "Beziehung",
    "Are you sure?": "Bist du dir sicher?",
    "When you restart the game, you have to start all over again.": "Wenn du das Spiel neustartest, fängst du wieder ganz von vorne an.",
    "Yes, restart!": "Ja, Neustart!",
    "No, continue the game!": "Nein, weiterspielen!",
    "Please choose your language.": "Bitte wähle eine Sprache.",
    "Afterwards, you can continue your game without restarting.": "Danach kannst du das Spiel ganz normal weiterspielen, ohne es neu starten zu müssen.",
    "%ex1": "Hallo! Hier gibt es noch nicht viel zu sehen. Probiere doch einfach die Funktionen aus und erstelle ein tolles ER-Diagramm.",
}

lang_en = {
    "%ex1": "Hello! There's not much to see here yet. Why don't you just try out all features and create a great ER diagram."
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