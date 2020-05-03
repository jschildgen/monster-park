_e = [];
_r = [];

/* creating a new entitytype */
$("#ctrl_new_entitytype").click(function() {
    var cell = createEntitytype({"_e":""}); /* add to graph */
    _e[cell.cid] = {cell: cell};                /* add to entity directory */
    if(highlighted_cell != undefined) { onSelect(highlighted_cell); }
});

/* creating a new relationship */
$("#ctrl_new_relationship").click(function() {
    var cell = createRelationship({"_r":""}); /* add to graph */
    _r[cell.cid] = {cell: cell};                  /* add to entity directory */
    if(highlighted_cell != undefined) { onSelect(highlighted_cell); }
});

/* creating a new attribute or sub-attribute */
$('#ctrl_new_attribute,#ctrl_new_subattribute').click(function() {
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

/* deleting an entity type, relationship or attribute */
$("#ctrl_delete").click(function() {
    var cid = highlighted_cell.model.cid;
    highlighted_cell.unhighlight();
    graph.removeCells(graph.getCell(cid));  /* remove from graph */
    delete_entitytype(cid);                 /* remove from directory */
    delete_relationship(cid);
    delete_attribute(_e, cid);
    delete_attribute(_r, cid);
    /* TODO: recursively remove sub-attributes */
    onUnselect();
});

function delete_entitytype(cid) {
    if(_e[cid] == undefined) { return; }
    if(_e[cid]._a != undefined) { delete_attribute([_e[cid]], null); }
    delete _e[cid];
}

function delete_relationship(cid) {
    if(_r[cid] == undefined) { return; }
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
        if(parentset[c]._a == undefined) { return; }
        for(var att in parentset[c]._a) {
            delete_attribute([parentset[c]._a[att]], cid);
        }
        if(cid != null) {
            delete parentset[c]._a[cid];
        } else {
            for(var att in parentset[c]._a) {
                delete parentset[c]._a[att];
                graph.removeCells(graph.getCell(att));
            }
        }
    }
}

function find_attribute(cid, parent = null) {
    if(parent == null) { return find_attribute(cid, _e) != null ? find_attribute(cid, _e) : find_attribute(cid, _r); }
    for(var c in parent) { console.log("Search for cid "+cid+" in parent "+c)
        if(parent[c]._a == undefined) { continue; }
        if(parent[c]._a[cid] != undefined) { console.log("found"); return parent[c]._a[cid]; /* found! */ }
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
    $("#ctrl_delete").removeClass("disabled brown").addClass("red");
    foo = cell;

    switch (cell.attributes()["data-type"]) {
        case "erd.Entity":
            $(".ctrl_entitytype").css("visibility", "visible").show();
            $("#ctrl_input_name").val(_e[cid].name != undefined ? _e[cid].name : "");
            $("#ctrl_input_name").focus();
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
        case "erd.Normal":
            $(".ctrl_attribute").css("visibility", "visible").show();
            var attr = find_attribute(cid);
            $("#ctrl_input_name").val(attr.name != undefined ? attr.name : "");
            $("#ctrl_input_name").focus();
            break;
    }

}




function onUnselect() {
    $("#ctrl_delete").removeClass("red").addClass("disabled brown");
    $(".ctrl_entitytype").css("visibility", "hidden").hide();
    $(".ctrl_relationship").css("visibility", "hidden").hide();
    $(".ctrl_attribute").css("visibility", "hidden").hide();
    $("#ctrl_input_name").val("");
}