_e = [];
_r = [];

/* creating a new entitytype */
$("#ctrl_new_entitytype").click(do_create_entitytype = function() {
    var cell = createEntitytype({"_e":""}); /* add to graph */
    _e[cell.cid] = {cell: cell};                /* add to entity directory */
    if(highlighted_cell != undefined) { onSelect(highlighted_cell); }
});

/* creating a new relationship */
$("#ctrl_new_relationship").click(do_create_relationship = function() {
    var cell = createRelationship({"_r":""}); /* add to graph */
    _r[cell.cid] = {cell: cell};                  /* add to entity directory */
    if(highlighted_cell != undefined) { onSelect(highlighted_cell); }
});

/* creating a new attribute or sub-attribute */
$('#ctrl_new_attribute,#ctrl_new_subattribute').click(do_create_attribute = function() {
    if(highlighted_cell == undefined) { return; }
    var cid = highlighted_cell.model.cid;
    var parent;
    switch(highlighted_cell.attributes()["data-type"]) {
        case "erd.Entity": parent = _e[cid]; break;
        case "erd.Relationship" : parent = _r[cid]; break;
        default:
            if(this.id == 'ctrl_new_subattribute') { parent = find_attribute(cid); break; }
            parent = find_root(cid); break;    /* attribute is selected => find its parent entity type or relationship */
    }
    if(parent._a == undefined) { parent._a = []; }
    var att_obj = new Attribute();
    graph.addCell(att_obj);                     /* add to graph */
    att_obj.position(parent.cell.position().x-200+Math.floor(Math.random()*400),
        parent.cell.position().y-200+Math.floor(Math.random()*400));
    createLink(parent.cell, att_obj, graph);
    parent._a[att_obj.cid] = {cell: att_obj};    /* add to _e/_r directory */
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

    highlighted_cell.model.attr("text/text", attr.name+"_");
    highlighted_cell.model.attr("text/text", attr.name);
});

/* deleting an entity type, relationship or attribute */
$("#ctrl_delete").click(do_delete = function() {
    var cid = highlighted_cell.model.cid;
    highlighted_cell.unhighlight();
    graph.removeCells(graph.getCell(cid));  /* remove from graph */
    delete_entitytype(cid);                 /* remove from directory */
    delete_relationship(cid);
    delete_attribute(_e, cid);
    delete_attribute(_r, cid);
    onUnselect();
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
    switch(highlighted_cell.attributes()["data-type"]) {
        case "erd.Entity":
            entry = _e[cid];
            break;
        case "erd.Relationship":
            entry = _r[cid];
            break;
        default:
            entry = find_attribute(cid);
            break;
    }
    entry.name = $(this).val();             /* change name in directory */
    entry.cell.attr("text/text",$(this).val())  /* change name in graph */
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
});

foo = null;
// $(foo2.el).effect("pulsate")
function onSelect(cell) {
    onUnselect();
    var cid = cell.model.cid;

    switch (cell.attributes()["data-type"]) {
        case "erd.Entity":
            $(".ctrl_entitytype").css("visibility", "visible").show();
            $("#ctrl_input_name").val(_e[cid].name != undefined ? _e[cid].name : "");
            $("#ctrl_input_name").focus();

            /* select lists for participating entity types */
            $('#ctrl_select_super').html('<option></option>');
            for(var super_cid in _e) {
                if(super_cid == cid) { continue; /* not showing entity type itself */ }
                /* selected as supertype */
                if(_e[cid].isa != undefined && _e[cid].isa.cid == super_cid) {
                    $('#ctrl_select_super').append(new Option(_e[super_cid].name, super_cid, true, true));
                } else {
                    $('#ctrl_select_super').append(new Option(_e[super_cid].name, super_cid));
                }
            }

            break;

        case "erd.Relationship":
            var rel = _r[cid];
            $(".ctrl_relationship").css("visibility", "visible").show();
            $("#ctrl_input_name").val(_r[cid].name != undefined ? _r[cid].name : "");
            $("#ctrl_input_name").focus();

            /* select lists for participating entity types */
            $('#ctrl_select_e1,#ctrl_select_e2').html('<option></option>');
            for(var cid in _e) {
                /* selected as first entity type */
                if(rel._e != undefined && rel._e[0] != undefined && rel._e[0].cid == cid) {
                    $('#ctrl_select_e1').append(new Option(_e[cid].name, cid, true, true));
                } else {
                    $('#ctrl_select_e1').append(new Option(_e[cid].name, cid));
                }
                /* selected as second entity type */
                if(rel._e != undefined && rel._e[1] != undefined && rel._e[1].cid == cid) {
                    $('#ctrl_select_e2').append(new Option(_e[cid].name, cid, true, true));
                } else {
                    $('#ctrl_select_e2').append(new Option(_e[cid].name, cid));
                }
            }

            /* select list for cardinalities */
            $('#ctrl_card_e1,#ctrl_card_e2').html('');
            var cards = ["1", "1"]
            if(rel._e != undefined && rel._e[0] != undefined) { cards[0] = rel._e[0].card }
            if(rel._e != undefined && rel._e[1] != undefined) { cards[1] = rel._e[1].card }

            var N_or_M = "N"; /* option for second cardinality */
            if(cards[0] == "1") {
                $('#ctrl_card_e1').append(new Option("1", "1", true, true));
                $('#ctrl_card_e1').append(new Option("N", "N"));
            } else {
                $('#ctrl_card_e1').append(new Option("1", "1"));
                $('#ctrl_card_e1').append(new Option("N", "N", true, true));
                N_or_M = "M";
            }

            if(cards[1] == "1") {
                $('#ctrl_card_e2').append(new Option("1", "1", true, true));
                $('#ctrl_card_e2').append(new Option(N_or_M, N_or_M));
            } else {
                $('#ctrl_card_e2').append(new Option("1", "1"));
                $('#ctrl_card_e2').append(new Option(N_or_M, N_or_M, true, true));
            }



            break;
        case "erd.Normal":      /* Attribute */
            $(".ctrl_attribute").css("visibility", "visible").show();
            var attr = find_attribute(cid);
            $("#ctrl_input_name").val(attr.name != undefined ? attr.name : "");
            $("#ctrl_input_name").focus();
            if(find_root(cid).cell.attributes.type == "erd.Relationship") {
                $('.hide_for_relationship_attributes').hide();
            } else {
                $('.hide_for_relationship_attributes').show();
            }

            $("#attr_primary").prop("checked", (attr.options != undefined && attr.options.indexOf("primary")>-1));
            $("#attr_mult").prop("checked", (attr.options != undefined && attr.options.indexOf("multi")>-1));
            break;

        default:
            return;
    }
    $("#ctrl_delete").removeClass("disabled brown").addClass("red");
}


function onUnselect() {
    $("#ctrl_delete").removeClass("red").addClass("disabled brown");
    $(".ctrl_entitytype").css("visibility", "hidden").hide();
    $(".ctrl_relationship").css("visibility", "hidden").hide();
    $(".ctrl_attribute").css("visibility", "hidden").hide();
    $("#ctrl_input_name").val("");
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