_e = [];
_r = [];

/* creating a new entitytype */
$("#ctrl_new_entitytype").click(do_create_entitytype = function() {
    var cell = createEntitytype({"_e":""}); /* add to graph */
    _e[cell.cid] = {cell: cell};                /* add to entity directory */
    highlight(cell);
    check_exercise();
});

/* creating a new relationship */
$("#ctrl_new_relationship").click(do_create_relationship = function() {
    var cell = createRelationship({"_r":""}); /* add to graph */
    _r[cell.cid] = {cell: cell};                  /* add to entity directory */
    highlight(cell);
    check_exercise();
});

/* creating a new attribute or sub-attribute */
$('#ctrl_new_attribute,#ctrl_new_subattribute').click(do_create_attribute = function() {
    if(highlighted_cell == undefined) { return; }
    var cid = highlighted_cell.model.cid;
    var parent;
    if(cid in _e) {
        parent = _e[cid];
    } else if(cid in _r) {
        parent = _r[cid];
    } else {
        if (this.id == 'ctrl_new_subattribute') {
            parent = find_attribute(cid);
        } else {
            parent = find_root(cid);            /* attribute is selected => find its parent entity type or relationship */
        }
    }

    if(parent._a == undefined) { parent._a = []; }
    var att_obj = new Attribute();
    graph.addCell(att_obj);                     /* add to graph */
    att_obj.position(parent.cell.position().x-200+Math.floor(Math.random()*400),
        parent.cell.position().y-200+Math.floor(Math.random()*400));
    createLink(parent.cell, att_obj, graph);
    parent._a[att_obj.cid] = {cell: att_obj};    /* add to _e/_r directory */
    highlight(att_obj);
    check_exercise();
});

/* changing attribute properties (primary key, multivalued */
$("#attr_primary,#attr_mult").change(function() {
    var mult_attr = {".inner":{"display":"block","stroke":"#797d9a","stroke-width":2,"cx":0,"cy":0,"rx":43,"ry":21,"fill":"#ffcb63"},"text":{"text":"","font-family":"Arial","text-decoration":"none", "font-size":14,"ref-x":0.5,"ref-y":0.5,"y-alignment":"middle","text-anchor":"middle","fill":"#000000","letterSpacing":0,"fontWeight":"bold"},"ellipse":{"transform":"translate(50, 25)"},".outer":{"stroke":"#797d9a","stroke-width":2,"cx":0,"cy":0,"rx":50,"ry":25,"fill":"#ffcb63","filter":{"name":"dropShadow","args":{"dx":0,"dy":2,"blur":2,"color":"#000000"}}}};
    var normal_attr = {"text":{"text":"","font-family":"Arial","text-decoration":"none", "font-size":14,"ref-x":0.5,"ref-y":0.5,"y-alignment":"middle","text-anchor":"middle","fill":"#000000","letterSpacing":0,"fontWeight":"bold"},"ellipse":{"transform":"translate(50, 25)"},".outer":{"stroke":"#ffcb63","stroke-width":2,"cx":0,"cy":0,"rx":50,"ry":25,"fill":"#ffcb63","filter":{"name":"dropShadow","args":{"dx":0,"dy":2,"blur":2,"color":"#222138"}}},".inner":{"stroke":"#D35400","stroke-width":2,"cx":0,"cy":0,"rx":45,"ry":20,"fill":"#E67E22","display":"none"}};
    var key_attr = {"ellipse":{"stroke-width":4,"transform":"translate(50, 25)"},"text":{"text":"","font-weight":"800","text-decoration":"underline","font-family":"Arial","font-size":14,"ref-x":0.5,"ref-y":0.5,"y-alignment":"middle","text-anchor":"middle","fill":"#000000","letterSpacing":0,"fontWeight":"bold"},".outer":{"stroke":"none","stroke-width":2,"cx":0,"cy":0,"rx":50,"ry":25,"fill":"#ffcb63","filter":{"name":"dropShadow","args":{"dx":0,"dy":2,"blur":2,"color":"#222138"}}},".inner":{"stroke":"none","stroke-width":2,"cx":0,"cy":0,"rx":45,"ry":20,"fill":"#ffcb63","display":"none"}};

    var cid = highlighted_cell.model.cid;
    var attr = find_attribute(cid);
    attr.options = [];

    if(this.id == "attr_primary" && this.checked) {
        highlighted_cell.model.attributes.attrs = key_attr;
        $("#attr_mult").prop('checked', false);
        attr.options.push("primary");
    } else if(this.id == "attr_mult" && this.checked) {
        highlighted_cell.model.attributes.attrs = mult_attr;
        $("#attr_primary").prop('checked', false);
        attr.options.push("multi");
    } else {
        highlighted_cell.model.attributes.attrs = normal_attr;
    }

    if(attr.name == undefined) { attr.name = ""; }

    highlighted_cell.model.attr("text/text", attr.name+"_");
    highlighted_cell.model.attr("text/text", attr.name);
    check_exercise();
});

/* deleting an entity type, relationship or attribute */
$("#ctrl_delete").click(do_delete = function() {
    var cid = highlighted_cell.model.cid;
    do_unhighlight();
    graph.removeCells(graph.getCell(cid));  /* remove from graph */
    delete_entitytype(cid);                 /* remove from directory */
    delete_relationship(cid);
    delete_attribute(_e, cid);
    delete_attribute(_r, cid);
    onUnselect();
    check_exercise();
});

$('html').keyup(function(e){
    if(e.keyCode == 46) { do_delete(); } /* del */
});

function delete_entitytype(cid) {
    if(_e[cid] == undefined) { return; }
    /* delete the entity type's attributes */
    if(_e[cid]._a != undefined) { delete_attribute([_e[cid]], null); }
    /* does this entity type have a super-type? */
    if(_e[cid].isa != undefined) { _e[cid].isa.cell.remove(); }
    /* is this entity type the super-type of others? */
    for(var sub_cid in _e) {
        if(_e[sub_cid].isa != undefined && _e[sub_cid].isa.cid == cid) {
            _e[sub_cid].isa.cell.remove();
        }
    }
    delete _e[cid];
    check_exercise();
}

function delete_relationship(cid) {
    if(_r[cid] == undefined) { return; }
    /* delete the relationship attributes */
    if(_r[cid]._a != undefined) { delete_attribute([_r[cid]], null); }
    delete _r[cid];
}

/**
 * Deletes one specific or all attributes under the elements in a given set
 * @param parentset: cascading deletion of the attribute starts here
 * @param cid when null, then all attributes, otherwise one specific cid will be deleted
 */
function delete_attribute(parentset, cid) {
    for(var c in parentset) {
        if(parentset[c] == undefined || parentset[c]._a == undefined) { return; }
        for(var att in parentset[c]._a) {
            delete_attribute([parentset[c]._a[att]], cid);
        }
        if(cid != null) {
            delete_attribute([parentset[c]._a[cid]], null); /* delete all sub-attributes */
            delete parentset[c]._a[cid];
        } else {
            for(var att in parentset[c]._a) {
                graph.removeCells(graph.getCell(att));
                delete parentset[c]._a[att];
            }
        }
    }
    check_exercise();
}

function find_attribute(cid, parent = null) {
    if(parent == null) { return find_attribute(cid, _e) != null ? find_attribute(cid, _e) : find_attribute(cid, _r); }
    for(var c in parent) {
        if(parent[c]._a == undefined) { continue; }
        if(parent[c]._a[cid] != undefined) { return parent[c]._a[cid]; /* found! */ }
        var recursive_search = find_attribute(cid, parent[c]._a);
        if(recursive_search != null) { return recursive_search; }
    }
    return null;
}

function find_root(cid) {
    for(var c in _e) {
        if ((_e[c]._a != undefined && _e[c]._a[cid] != undefined) || find_attribute(cid, _e[c]._a) != null) {
            return _e[c];
        }
    }
    for(var c in _r) {
        if ((_r[c]._a != undefined && _r[c]._a[cid] != undefined) || find_attribute(cid, _r[c]._a) != null) {
            return _r[c];
        }
    }
    return null;
}

/* changing the name of an entity type, relationship or attribute */
$("#ctrl_input_name").keyup(function() {
    var cid = highlighted_cell.model.cid;
    var entry;
    if(cid in _e) {
        entry = _e[cid];
    } else if(cid in _r) {
        entry = _r[cid];
    } else {
        entry = find_attribute(cid);
    }
    entry.name = $(this).val();             /* change name in directory */
    entry.cell.attr("text/text",$(this).val())  /* change name in graph */
    check_exercise();
});

/* changing super-entity  */
$('#ctrl_select_super').change(function() {
    var cid = highlighted_cell.model.cid;
    var super_cid = $('#ctrl_select_super')[0].value;

    /* remove from graph */
    if(_e[cid].isa != undefined && _e[cid].isa.cell != undefined) { _e[cid].isa.cell.remove(); }

    if(super_cid != "") {
        /* add to graph */
        var isa_obj = new ISA();
        isa_obj.position(graph.getCell(super_cid).position().x + 37, graph.getCell(super_cid).position().y + 45);
        graph.addCell(isa_obj)
        var link = createLink(isa_obj, graph.getCell(cid), graph);
        //createLink(isa_obj, graph.getCell(super_cid), graph);

        /* add is-a information to entity directory */
        _e[cid].isa = {cid: super_cid, cell: isa_obj};
    } else {
        delete _e[cid].isa;
    }
    check_exercise();
});

/* changing the entity types belonging to a relationship */
/* or changing cardinalities of a relationship */
$('#ctrl_select_e1,#ctrl_select_e2,#ctrl_card_e1,#ctrl_card_e2').change(function() {
    var cid = highlighted_cell.model.cid;
    /* remove existing links first */
    for(e in _r[cid]._e) { _r[cid]._e[e].link.remove() }
    _r[cid]._e = [];

    /* add links to directory and graph */
    var e1_cid = $('#ctrl_select_e1')[0].value;
    var e2_cid = $('#ctrl_select_e2')[0].value;

    var card1 = $('#ctrl_card_e1').val();
    var card2 = $('#ctrl_card_e2').val();
    var card2 = card1 == "N" && card2 == "N" ? "M" : card1 == "1" && card2 == "M" ? "N" : card2;

    if(e1_cid != "") { _r[cid]._e[0] = {cid: e1_cid, card: card1, link: createLink(graph.getCell(cid), graph.getCell(e1_cid), graph) }; }
    if(e2_cid != "") { _r[cid]._e[1] = {cid: e2_cid, card: card2, link: createLink(graph.getCell(cid), graph.getCell(e2_cid), graph) }; }

    /* add cardinalities */
    if(_r[cid]._e[0] != undefined) { _r[cid]._e[0].link.set(createLabel(_r[cid]._e[0].card)); }
    if(_r[cid]._e[1] != undefined) { _r[cid]._e[1].link.set(createLabel(_r[cid]._e[1].card)); }

    if(highlighted_cell != undefined) { onSelect(highlighted_cell); }
    check_exercise();
});

foo = null;
// $(foo2.el).effect("pulsate")
function onSelect(cell) {
    onUnselect();
    var cid = cell.model.cid;

    if(cid in _e) {
        $(".ctrl_entitytype").css("visibility", "visible").show();
        $("#ctrl_input_name").val(_e[cid].name != undefined ? _e[cid].name : "");
        $("#ctrl_input_name").focus();

        /* select lists for participating entity types */
        $('#ctrl_select_super').html('<option></option>');
        for (var super_cid in _e) {
            if (super_cid == cid) {
                continue; /* not showing entity type itself */
            }
            /* selected as supertype */
            if (_e[cid].isa != undefined && _e[cid].isa.cid == super_cid) {
                $('#ctrl_select_super').append(new Option(_e[super_cid].name, super_cid, true, true));
            } else {
                $('#ctrl_select_super').append(new Option(_e[super_cid].name, super_cid));
            }
        }
    } else if (cid in _r) {
        var rel = _r[cid];
        $(".ctrl_relationship").css("visibility", "visible").show();
        $("#ctrl_input_name_box").css("left", "212px");
        $("#ctrl_input_name").val(_r[cid].name != undefined ? _r[cid].name : "");
        $("#ctrl_input_name").focus();

        /* select lists for participating entity types */
        $('#ctrl_select_e1,#ctrl_select_e2').html('<option></option>');
        for (var cid in _e) {
            /* selected as first entity type */
            if (rel._e != undefined && rel._e[0] != undefined && rel._e[0].cid == cid) {
                $('#ctrl_select_e1').append(new Option(_e[cid].name, cid, true, true));
            } else {
                $('#ctrl_select_e1').append(new Option(_e[cid].name, cid));
            }
            /* selected as second entity type */
            if (rel._e != undefined && rel._e[1] != undefined && rel._e[1].cid == cid) {
                $('#ctrl_select_e2').append(new Option(_e[cid].name, cid, true, true));
            } else {
                $('#ctrl_select_e2').append(new Option(_e[cid].name, cid));
            }
        }

        /* select list for cardinalities */
        $('#ctrl_card_e1,#ctrl_card_e2').html('');
        var cards = ["1", "1"]
        if (rel._e != undefined && rel._e[0] != undefined) {
            cards[0] = rel._e[0].card
        }
        if (rel._e != undefined && rel._e[1] != undefined) {
            cards[1] = rel._e[1].card
        }

        var N_or_M = "N"; /* option for second cardinality */
        if (cards[0] == "1") {
            $('#ctrl_card_e1').append(new Option("1", "1", true, true));
            $('#ctrl_card_e1').append(new Option("N", "N"));
        } else {
            $('#ctrl_card_e1').append(new Option("1", "1"));
            $('#ctrl_card_e1').append(new Option("N", "N", true, true));
            N_or_M = "M";
        }

        if (cards[1] == "1") {
            $('#ctrl_card_e2').append(new Option("1", "1", true, true));
            $('#ctrl_card_e2').append(new Option(N_or_M, N_or_M));
        } else {
            $('#ctrl_card_e2').append(new Option("1", "1"));
            $('#ctrl_card_e2').append(new Option(N_or_M, N_or_M, true, true));
        }
    } else {
        var attr = find_attribute(cid);
        if(attr == null) { return; }

        $(".ctrl_attribute").css("visibility", "visible").show();
        $("#ctrl_input_name").val(attr.name != undefined ? attr.name : "");
        $("#ctrl_input_name").focus();
        if (find_root(cid).cell.attributes.type == "erd.Relationship") {
            $('.hide_for_relationship_attributes').hide();
        } else {
            $('.hide_for_relationship_attributes').show();
        }

        $("#attr_primary").prop("checked", (attr.options != undefined && attr.options.indexOf("primary") > -1));
        $("#attr_mult").prop("checked", (attr.options != undefined && attr.options.indexOf("multi") > -1));
    }
    $("#ctrl_delete").css("visibility", "visible").show();
}


function onUnselect() {
    $("#ctrl_delete").css("visibility", "hidden").hide();
    $(".ctrl_entitytype").css("visibility", "hidden").hide();
    $(".ctrl_relationship").css("visibility", "hidden").hide();
    $(".ctrl_attribute").css("visibility", "hidden").hide();
    $("#ctrl_input_name").val("");
    $("#ctrl_input_name_box").css("left", "63px");
}

function onMove(cell) {
    var cid = cell.cid;

    switch (cell.attributes.type) {
        case "erd.Entity":
            /* is this entity type the super-type of others? */
            for(var sub_cid in _e) {
                if(_e[sub_cid].isa != undefined && _e[sub_cid].isa.cid == cid) {
                    _e[sub_cid].isa.cell.position(cell.position().x + 37, cell.position().y + 45);
                }
            }
            break;
    }
}




/*** STORY ***/

tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate()+1);
tomorrow = tomorrow.toLocaleDateString();

story = [
    {
        "de": "Willkommen im MonstER-Park! Hier soll einmal der größte Monster-Freizeitpark der Welt entstehen. Leider läuft es mit der Planung gerade gar nicht gut. Kannst du mir vielleicht etwas helfen, damit der Park pünktlich eröffnen kann? Ich werde nämlich dauernd von diesen kleinen Monstern abgelenkt. Oh, da ist ja schon wieder eins!",
        "en": "Welcome to MonstER Park! Soon, here will be the the largest monster theme park in the world. Unfortunately, the planning is not going well at the moment. Could you please help me so that the park can open on time? Because I keep getting distracted by these little monsters. Oh, there's again one monster!",
        "left": "avatar.png", "right": "arthur_frei.png",
    },
    {
        "de": "Hallo! Ich bin Monster Nummer 1, ich heiße Bolbo!",
        "en": "Hello! I'm Monster Number 1, my name is Bolbo!",
        "left": "avatar_ueberrascht.png", "right": "bolbo.png",
    },
    {
        "de": "Hi Bolbo! Das heißt also, jedes Monster hat eine Monsternr und einen Namen. Ich erstelle dann also einen Entitätstypen \"Monster\" mit den beiden Attributen \"Monsternr\" und \"Name\".",
        "en": "Hi Bolbo! This means, every monster has a monster number and a name. So I create an entity type \"Monster\" with the two attributes \"Monster-ID\" and \"Name\".",
        "left": "avatar_winkend.png", "right": "bolbo.png", "me": true,
        "_e": [{
            "name": ["monster", "monsters"],
            "_a": [
                {"name":["monsternr","monsternummer","monsterid", "monsterno", "monsternumber"]},
                {"name":["name","monstername"]}
            ]
        }],
    },
    {
        "de": "Super gemacht! Ich freue mich schon, wenn der MonstER-Park eröffnet wird und uns die ersten Trainer besuchen kommen.",
        "en": "Good job! I am looking forward to the MonstER-Park opening and the first trainers coming to visit us.",
        "left": "avatar_freuend.png", "right": "bolbo.png",
    },
    {
        "de": "Male bitte auf, dass es Trainer geben kann und dass jeder Trainer eine Trainer-ID, einen Spitznamen und ein Geschlecht hat.",
        "en": "Please note that there can be trainers and that each trainer has a trainer ID, nickname and gender.",
        "left": "avatar.png", "right": "bolbo.png",
        "_e": [{
            "name": ["trainer", "trainers", "trainerin", "coach"],
            "_a": [
                {"name":["trainernr","trainernummer","trainerid", "trainerno", "trainernumber"]},
                {"name":["spitzname", "name","trainername", "nickname"]},
                {"name":["geschlecht", "gender", "sex"]}
            ]
        }],
    },
    {
        "de": "Hab ich schon gesagt, dass ich Monster Nummer 1 bin? Diese Nummer habe nur ich! Es gibt zwar noch weitere Bolbos im Monster Park, aber keiner außer mir hat die Nummer 1.",
        "en": "Did I mention I'm monster Number 1? I'm the only one with that number! There are other Bolbos in Monster Park, but nobody has number 1 but me.",
        "left": "avatar.png", "right": "bolbo.png",
    },
    {
        "de": "Okay, das heißt, ich muss die Monsternummer unterstreichen und sie damit zum Primärschlüssel machen, weil sie ein Monster eindeutig identifiziert.",
        "en": "Okay, that means I have to underline the monster number to specify that this is the primary key. It uniquely identifies a monster.",
        "left": "avatar.png", "right": "bolbo.png", "me": true,
        "_e": [{
            "name": ["monster", "monsters"],
            "_a": [
                {"name":["monsternr","monsternummer","monsterid", "monsterno", "monsternumber"], "options": ["primary"]},
            ]
        }],
    },
    {
        "de": "Wie ist das eigentlich bei Trainern? Was ist da der Primärschlüssel?",
        "en": "How should we do it with the trainers? What's the primary key there?",
        "left": "avatar.png", "right": "bolbo.png",
        "_e": [{
            "name": ["trainer", "trainers", "trainerin"],
            "_a": [
                {"name":["trainernr","trainernummer","trainerid", "trainerno", "trainernumber"], "options": ["primary"]},
            ]
        }],
    },
    {
        "de": "Ich hoffe ich finde bald einen Trainer, der sich um mich kümmert!",
        "en": "I hope I find a trainer soon who will take care of me!",
        "left": "avatar.png", "right": "bolbo.png",
    },
    {
        "de": "Ach so, ein Monster gehört also einem Trainer. Dann erstelle ich mal eine Beziehung.",
        "en": "Oh, so a monster belongs to a trainer. I'm going to create a relationship.",
        "left": "avatar_freuend.png", "right": "bolbo.png",
        "me": true,
        "_r": [
            {
                "name": ["gehoert", "gehoertzu", "besitzt", "hat", "kuemmertsichum", "trainiert", "belongto", "belongsto", "owns", "own", "has", "have", "takecareof", "takescareof", "train", "trains"],
                "_e": ["monster", "trainer"],
            }
        ]
    },
    {
        "de": "Aber Achtung: Jedes Monster gehört immer nur einem Trainer. Aber ein Trainer kann viele Monster haben!",
        "en": "But be careful: Each monster belongs to only one trainer at a time. But a trainer can have many monsters!",
        "left": "avatar_ueberrascht.png", "right": "bolbo.png",
        "_r": [
            {
                "name": ["gehoert", "gehoertzu", "besitzt", "hat", "kuemmertsichum", "trainiert", "belongto", "belongsto", "owns", "own", "has", "have", "takecareof", "takescareof", "train", "trains"],
                "_e": ["monster", "trainer"],
                "card": ["N", "1"]
            }
        ]
    },
    {
        "de": "Wusstest du, dass es auch Teams gibt? Ein Team hat einen Teamnamen und eine Farbe.",
        "en": "Did you know that we have teams in MonstER Park? A team has a team name and a color.",
        "left": "avatar.png", "right": "bolbo.png",
        "_e": [
            {
                "name": ["team", "teams"],
                "_a": [
                    {"name": ["teamname", "name" ]},
                    {"name": ["farbe", "teamfarbe", "color", "teamcolor", "colour", "teamcolour"]}
                ]
            }
        ]
    },
    {
        "de": "Da ein Team keine Nummer hat, mach einfach den Teamnamen zum Primärschlüssel. Er ist eindeutig.",
        "en": "Since a team has no number, just specify the team name as the primary key. It's unique.",
        "left": "avatar_freuend.png", "right": "bolbo.png",
        "_e": [
            {
                "name": ["team", "teams"],
                "_a": [
                    {"name": ["teamname", "name"], "options": ["primary"]}
                ]
            }
        ]
    },
    {
        "de": "Und jetzt male bitte auf, dass ein Trainer in einem Team sein kann. In einem Team können aber natürlich mehrere Trainer sein!",
        "en": "And now please write down that a trainer can be in a team. But of course, there can be multiple trainers in one team!",
        "left": "avatar_freuend.png", "right": "bolbo.png",
        "_r": [
            {
                "name": ["in", "istin", "sindin", "gehoertzu", "gehoertan", "bestehtaus", "umfasst", "istmitgliedvon", "istmitgliedin", "istmitglied", "mitglied", "mitgliedvon", "mitgliedin", "istteilvon", "on", "ison", "isin", "arein", "areon", "consistof", "consistsof", "memberof", "partof", "arememberof", "arepartof", "within", "kämpftfür", "kämpfenfür"],
                "_e": ["trainer", "team"],
                "card": ["N", "1"]
            }
        ]
    },
    {
        "de": "Ich habe noch was vergessen: Nicht nur Teams haben eine Farbe, sondern auch Monster! Wie du siehst bin ich Gelb-Schwarz!",
        "en": "I forgot something to say: Not only teams have a color, but also monsters! As you can see, I am yellow and black!",
        "left": "avatar.png", "right": "bolbo.png",
    },
    {
        "de": "Oha, das heißt Monster haben mehrere Farben. \"Farbe\" muss also ein mehrwertiges Attribut sein.",
        "en": "Oh, that means monsters have multiple colors. So \"color\" must be a multi-valued attribute.",
        "left": "avatar.png", "right": "bolbo.png", "me": true,
        "_e": [{
            "name": ["monster", "monsters"],
            "_a": [
                {"name":["farbe","monsterfarbe","farben", "color", "monstercolor", "colour", "monstercolour", "colors", "colours"], "options": ["multi"]},
            ]
        }],
    },
    {
        "de": "Juhu, jetzt weiß jeder, dass ich Gelb-Schwarz bin! Ich verrate dir noch was: Ich heiße gar nicht einfach nur Bolbo. Ich heiße Bolbo Brillenfrosch!",
        "en": "Yay, now everybody knows I'm yellow-black! I'll tell you something: My name is not just Bolbo. It's Bolbo Frogman.",
        "left": "avatar_freuend.png", "right": "bolbo.png",
    },
    {
        "de": "Potzblitz, dann besteht der Name eines Monsters also aus den Sub-Attributen Vorname und Nachname!",
        "en": "Wow, then the name of a monster consists of the sub-attributes first name and last name!",
        "left": "avatar.png", "right": "bolbo.png", "me": true,
        "_e": [{
            "name": ["monster", "monsters"],
            "_a": [
                {"name":["name","monstername"], "_a": [
                        {"name": ["vorname", "rufname", "firstname", "forename", "prename", "givenname"]},
                        {"name": ["nachname","familienname", "lastname", "surname", "familyname"]}
                    ]}
            ]
        }],
    },
    {
        "de": "Huhu, ich bin Trina! Ich bin die Tochter von Bolbo!",
        "en": "Yoo-hoo, I'm Trina! I'm Bolbo's daughter!",
        "left": "avatar.png", "right": "trina.png",
    },
    {
        "de": "Hi Trina! Das heißt ja dann, wir brauchen eine Beziehung, damit Monster Kinder von anderen Monstern sein können.",
        "en": "Hi Trina! That means we need a relationship so that monsters can be children of other monsters.",
        "left": "avatar_winkend.png", "right": "trina.png", "me": true,
        "_r": [
            {
                "name": ["istkindvon", "istkind", "sindkindvon", "sindkind", "kindvon", "kind", "eltern", "sindeltern", "elternteil", "sindelternteil", "istelternteil", "hatkind", "hatkinder", "habenkinder", "ischild", "ischildof", "arechild", "arechildof", "havechildren", "havechild", "haschildren", "haschild", "child", "children", "parent", "parents", "kids", "kid"],
                "_e": ["monster", "monster"],
            }
        ]
    },
    {
        "de": "Ja genau! Ein Monster hat mehrere Elternteile und Eltern können natürlich auch viele Kinder haben.",
        "en": "Yeah, right! A monster has multiple parents and parents can have many children.",
        "left": "avatar.png", "right": "trina.png",
        "_r": [
            {
                "name": ["istkindvon", "istkind", "sindkindvon", "sindkind", "kindvon", "kind", "eltern", "sindeltern", "elternteil", "sindelternteil", "hatkind", "hatkinder", "habenkinder", "ischild", "ischildof", "arechild", "arechildof", "havechildren", "havechild", "haschildren", "haschild", "child", "children", "parent", "parents", "kids", "kid"],
                "_e": ["monster", "monster"],
                "card": ["N", "N"]
            }
        ]
    },
    {
        "de": "Wie du siehst, bin ich kein normales Monster. Ich bin ein Flugmonster! Ich habe vier Flügel!",
        "en": "As you can see, I'm not an ordinary monster. I'm a flying monster! I have four wings!",
        "left": "avatar_ueberrascht.png", "right": "trina.png",
    },
    {
        "de": "Das heißt es muss einen Unter-Entitätstypen \"Flugmonster\" geben. Ein Flugmonster ist ein Monster.",
        "en": "That means there must be a sub-entity-type \"flying monster\". A flying monster is a monster.",
        "left": "avatar.png", "right": "trina.png", "me": true,
        "_e": [{
            "name": ["flugmonster", "flugmonsters", "flyingmonster", "flightmonster", "flymonster"],
            "isa": "monster"
        }],
    },
    {
        "de": "Hey, hast du Trina gesehen? Ich habe ihr tolle Neuigkeiten zu erzählen! Und zwar ist meine Temperatur von 800°C auf 900°C gestiegen!",
        "en": "Hey, have you seen Trina? I have some great news to tell her! My temperature went from 800° to 900°!",
        "left": "avatar.png", "right": "fibi.png",
    },
    {
        "de": "Hi du! Trina kommt bestimmt gleich wieder. Ich vermerke noch kurz, dass es den Subtyp Feuermonster gibt und dass diese eine Temperatur haben.",
        "en": "Hi there! Trina will be right back. I will briefly note that there is a subtype \"fire monster\" and that they have a temperature.",
        "left": "avatar_winkend.png", "right": "fibi.png", "me": true,
        "_e": [{
            "name": ["feuermonster", "feuermonsters", "firemonster", "firemonsters"],
            "_a": [
                {"name":["temperatur","grad","hitze", "temperature", "degree", "heat"] }
            ],
            "isa": "monster"
        }],
    },
    {
        "de": "Wie ich sehe, hast du schon meinen Kumpel Fibi kennengelernt. Ich musste gerade kurz verschwinden, weil ich mich für einen Wettbewerb angemeldet habe.",
        "en": "I see you've already met my buddy Fibi. I just had to step away for a second because I signed up for a competition.",
        "left": "avatar.png", "right": "trina.png",
    },
    {
        "de": "Hier finden nämlich ganz oft Wettbewerbe statt! Jeder Wettbewerb hat ein Datum und eine Bezeichnung.",
        "en": "Many competitions take place in MonstER park! Each competition has a date and a name.",
        "left": "avatar.png", "right": "trina.png",
        "_e": [{
            "name": ["competition", "contest", "challenge",
                "wettbewerb", "turnier", "wettbewerbe", "turniere"],
            "_a": [
                {"name": ["bezeichnung", "name", "description", "title"]},
                {"name": ["datum","tag","wann", "date", "time", "timestamp", "when"]}
            ]
        }]
    },
    {
        "de": "Der Wettbewerb, für den ich mich angemeldet habe, heißt Waldturnier. Er ist morgen, am "+tomorrow+". Heute war auch ein Waldturnier, da habe ich aber nicht teilgenommen.",
        "en": "The competition I have registered for is called the Forest Tournament. It's tomorrow, at "+tomorrow+". There was also a Forest Tournament today, but I didn't participate.",
        "left": "avatar.png", "right": "trina.png",
    },
    {
        "de": "Okay, das bedeutet, die Kombination aus Bezeichnung und Datum identifiziert einen Wettbewerb eindeutig.",
        "en": "Okay, that means the combination of name and date uniquely identifies a competition.",
        "left": "avatar.png", "right": "trina.png", "me": true,
        "_e": [{
            "name": ["competition", "contest", "challenge",
                "wettbewerb", "turnier", "wettbewerbe", "turniere"],
            "_a": [
                {"name": ["bezeichnung", "name", "description", "title"], "options":["primary"]},
                {"name": ["datum","tag","wann", "date", "time", "timestamp", "when"], "options":["primary"]}
            ]
        }]
    },
    {
        "de": "Ich will auch am Waldturnier teilnehmen!",
        "en": "I also want to participate in the forest tournament!",
        "left": "avatar_ueberrascht.png", "right": "fibi.png",
    },
    {
        "de": "Na klar! Ich erstelle dazu eine N:M-Beziehung, damit mehrere Monster an einem Wettbewerb und jedes Monster auch an mehreren Wettbewerben teilnehmen können.",
        "en": "Sure! I create an N:M relationship so that multiple monsters can participate in one competition and each monster can participate in multiple ones.",
        "left": "avatar_freuend.png", "right": "fibi.png", "me": true,
        "_r": [{
            "name":["nimmtteil","nehmenteil","teilnahme","teilnehmen",
                "participate","participates","participatein","enter","register","registerfor","attend","takepart","takepartin"],
            "_e":["monster","competition"],
            "card":["N","N"]
        }]
    },
    {
        "de": "Es ist noch wichtig, dass wir speichern, wann sich ein Monster für einen Wettbewerb angemeldet hat, also ein Beziehungsattribut \"Anmeldedatum\" oder sowas.",
        "en": "It's also important that we store the information when a monster has registered for a competition: a relationship attribute \"registration date\" or something like that.",
        "left": "avatar_freuend.png", "right": "fibi.png",
        "_r": [{
            "name":["nimmtteil","nehmenteil","teilnahme","teilnehmen",
                "participate","participates","participatein","enter","register","registerfor","attend","takepart","takepartin"],
            "_e":["monster","competition"],
            "card":["N","N"],
            "_a": [{"name":["anmeldedatum", "angemeldet", "anmeldung", "angemeldetam", "anmeldezeitpunkt", "anmeldezeit", "registriertam", "registrierdatum","registrierungsdatum",
                    "registrationdate","registerdate","registrationtime","registertime","signupdate","signuptime","signedupat","signedup","registred"]}]
        }]
    },
    {
        "de": "Trina, Fibi, hier seid ihr ja! Kommt schnell, sonst verpasst ihr die Eröffnung des Monster Parks! Alles ist startbereit, das ER-Diagramm ist fertig!",
        "en": "Trina, Fibi, there you are! Hurry, or you'll miss the opening of MonstER Park! Everything's ready to go, the ER diagram is finished!",
        "left": "avatar_ueberrascht.png", "right": "bolbo.png",
    },
    {
        "de": "Danke, dass du das ER-Diagramm erstellt hast und der Monster Park rechtzeitig eröffnen kann!",
        "en": "Thank you for creating the ER Diagram and making it possible that Monster Park opens on time!",
        "left": "avatar_freuend.png", "right": "arthur_frei.png",
    }
]

current_exercise = -1;
function check_exercise(continue_button = false) {
    if(current_exercise >= story.length-1) {
        //fireworks.start.apply(fireworks);
        _paq.push(['trackEvent', 'Game', 'Completed', '']);
        $('#continue_button').hide();
        $('#certificate_form').show();
    }
    matching_entities = [];
    for(var e = 0; e <= current_exercise; e++) {
        var ex = story[e];
        if (ex._e != undefined) {
            for (var i in ex._e) {  // are all required entity types present?
                var ent = ex._e[i];
                var matching_ent = null;
                for (var j in _e) {
                    if (ent.name.includes(norm(_e[j].name))) {
                        matching_ent = _e[j];
                        break;
                    }
                }
                if (matching_ent == null) {
                    return "entity type is missing";
                }
                matching_entities[ent.name[0]] = matching_ent;

                if(ent.isa != undefined) {  // should the entity type be a subtype of another?
                    if(matching_ent.isa == undefined) { return "no supertype specified"; }
                    if(matching_entities[ent.isa] == undefined) { return "subtype does not exist"; }
                    if(matching_ent.isa.cid != matching_entities[ent.isa].cell.cid) { return "wrong supertype"; }
                }

                if (ent._a != undefined) {  // are all required attributes present?
                    for (var a in ent._a) {
                        var att = ent._a[a];
                        var matching_att = null;
                        if (matching_ent._a == undefined) {
                            return "entity type has no attributes at all";
                        }
                        for (var j in matching_ent._a) {
                            if (att.name.includes(norm(matching_ent._a[j].name))) {
                                matching_att = matching_ent._a[j];
                                break;
                            }
                        }
                        if (matching_att == null) {
                            return "attribute is missing";
                        }
                        if(att.options != undefined) {  // should the attribute have any options (primary, multi)?
                            if(matching_att.options == undefined) { return; }
                            for(var o in att.options) {
                                if(!matching_att.options.includes(att.options[o])) { return "wrong attribute options"; }
                            }
                        }
                        if(att._a != undefined) {   // should the attribute have any sub-attributes?
                            if(matching_att._a == undefined) { return; }
                            for(var a in att._a) {
                                var found = false;
                                for(var b in matching_att._a) {
                                    if(att._a[a].name.includes(norm(matching_att._a[b].name))) {
                                        found = true;
                                        break;
                                    }
                                }
                                if(!found) { return "sub-attribute is missing"; }
                            }
                        }
                    }
                }
            }
        }
        if (ex._r != undefined) {
            for(var i in ex._r) {   // are all required relationships present?
                var rel = ex._r[i];
                var matching_rels = [];
                for (var j in _r) {
                    if (rel.name.includes(norm(_r[j].name))) {
                        matching_rels.push(_r[j]);
                    }
                }
                if (matching_rels.length == 0) {
                    return "relationship is missing";
                }
                var already_covered = [];
                for(var j in rel._e) {  // does the relationship connect the correct entity types?
                    var matching_ent = matching_entities[rel._e[j]];
                    if(matching_ent == undefined) { return "one of the relationship's entity types is not there"; }
                    var found = false;
                    for(var m in matching_rels) {
                        var matching_rel = matching_rels[m];
                        for (var k in matching_rel._e) {
                            var cid = matching_rel._e[k].cid;
                            if (cid == matching_ent.cell.cid && !already_covered.includes(k)) {
                                if (rel.card != undefined) {
                                    if (rel.card[j] == "1" && matching_rel._e[k].card != "1"
                                        || rel.card[j] != "1" && matching_rel._e[k].card == "1") {
                                        continue;
                                    }  // wrong cardinality
                                }
                                found = true;
                                already_covered.push(k);
                                break;
                            }

                        }
                    }
                    if(!found) {
                        return "relationship is connecting wrong entity types (or cardinalities do not match)";
                    }
                }
                if(rel._a != undefined) {
                    // are the required relationship attributes present?
                    for (var a in rel._a) {
                        var att = rel._a[a];
                        var matching_att = null;
                        if (matching_rel._a == undefined) {
                            return "relationship has no attributes at all";
                        }
                        for (var j in matching_rel._a) {
                            if (att.name.includes(norm(matching_rel._a[j].name))) {
                                matching_att = matching_rel._a[j];
                                break;
                            }
                        }
                        if (matching_att == null) {
                            return "attribute is missing";
                        }
                    }
                }
            }
        }
    }

    if(!continue_button && story[current_exercise]._e == undefined && story[current_exercise]._r == undefined) { return; }

    if(current_exercise >= 0) { _paq.push(['trackEvent', 'Game', 'Level '+current_exercise, '']); }
    current_exercise++;
    ex = story[current_exercise];
    $('#exercise_text').text(ex[language_code]);
    if(ex.me != undefined && ex.me) {
        $(".text-box-pointer").css("left", 20);
        $(".text-box-pointer-shadow").css("left", 13);
    } else {
        $(".text-box-pointer").css("left", 190);
        $(".text-box-pointer-shadow").css("left", 183);
    }
    $('#leftimg').css("background", "url('./images/"+ex.left+"') no-repeat");
    $('#rightimg').css("background", "url('./images/"+ex.right+"') no-repeat");

    if(ex._e == undefined && ex._r == undefined) {
        $('#continue_button').show();
    } else {
        $('#continue_button').hide();
    }

    check_exercise();   // maybe multiple exercises are solved together in one step
}

$('#continue_button').click(function() {
    check_exercise(true);
});

$('#joyride-button').click(function(e){
    $(document).foundation('joyride', 'start');
    $('.menu-content').hide();
    $('.menu-bg').hide();
});

$('#really-restart-button').click(function() {
    location.reload();
});

$('#not-restart-button').click(function(e){
    $('#restart-modal').foundation('reveal', 'close');
    $('.menu-content').hide();
    $('.menu-bg').hide();
});

$('#really-sandbox-button').click(function() {
    $(document).foundation('joyride', 'off');
    $('#sandbox-modal').foundation('reveal', 'close');
    $('.menu-content').hide();
    $('.menu-bg').hide();
    $('#sandbox-button').hide();
    $('#story').hide();
    $('.ribbon').css("background", "url('./images/wf/ribbon-tile_w.png') repeat-x");
    $('.ribbon .left').css("background", "url('./images/wf/ribbon-left_w.png') no-repeat");
    $('.ribbon .right').css("background", "url('./images/wf/ribbon-right_w.png') no-repeat");
    
    $("#erd").detach().appendTo("#screen-index");
    $("#erd").css("width", "100%");
    //initERD($("#erd"), $("#screen-index").width(), null);

    $("html,body,#erd").css("background-color", "white");    
});

$('#not-sandbox-button').click(function(e){
    $('#sandbox-modal').foundation('reveal', 'close');
    $('.menu-content').hide();
    $('.menu-bg').hide();
});



function norm(s) {
    if(s==undefined) { return undefined; }
    return s.toLowerCase()
        .replace(RegExp(String.fromCharCode(228),"g"), "ae")
        .replace(RegExp(String.fromCharCode(246),"g"), "oe")
        .replace(RegExp(String.fromCharCode(252),"g"), "ue")
        .replace(RegExp(String.fromCharCode(223),"g"), "ss")
        .replace(/[^a-z0-9]/g,"");
}

$(function () {
    check_exercise(true);
});

function do_unhighlight() {
    if(highlighted_cell != undefined && highlighted_cell.unhighlight != undefined) {
        highlighted_cell.unhighlight();
    } else if (highlighted_cell != undefined) {
        highlighter.remove();
        highlighted_cell = null;
    }
}

$('#certificate_button').click(function() {
    do_unhighlight();
    var old_background = $('#erd').css('background-color');
    $('#erd').css('background-color', 'white');
    graph.getLinks().forEach(function(link) {
        link.attr({

            '.marker-arrowheads': {
                fill: 'none'
            },
            '.connection-wrap': {
                fill: 'none',
                visibility: 'hidden'
            },
            '.marker-vertices': {
                fill: 'none',
                visibility: 'hidden'
            },
            '.link-tools': {
                fill: 'none'
            }
        });
    });

    ele = document.querySelector('#erd').parentNode.parentNode;

    html2canvas(ele, {}).then( canvas => {
        //document.write('<img src="'+canvas.toDataURL("image/png")+'"/>');
        $('#erd').css('background-color', old_background);
        var image = canvas.toDataURL("image/png");
        $.post("cert.php",
            {
                playername: $('#certificate_input_name').val(),
                image: image
            },
            function(data, status){
                _paq.push(['trackEvent', 'Game', 'Certificate', data+" ("+$('#certificate_input_name').val()+")"]);
                $('#certificate_open')[0].submit();
            });
    });
});