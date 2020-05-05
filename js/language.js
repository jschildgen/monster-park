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
}

if(window.navigator.language.slice(0, 2) == "de") {
    lang = lang_de;
} else {
    lang = lang_en;
}

$('.lang').each(function(e) {
    this.innerHTML = translate(this.innerHTML);
});

function translate(txt) {
    if(lang[txt] == undefined && window.navigator.language.slice(0, 2) != "en") {
        console.log('"'+txt+'": "", ');
        return txt;
    }
    return lang[txt];
}