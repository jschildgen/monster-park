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

/* deleting an entity type, relationship or attribute */
$("#ctrl_delete").click(function() {
    var cid = highlighted_cell.model.cid;
    highlighted_cell.unhighlight();
    graph.removeCells(graph.getCell(cid));  /* remove from graph */
    delete _e[cid];                         /* remove from directory */
    delete _r[cid];
    onUnselect();
});

/* changing the name of an entity type, relationship or attribute */
$("#ctrl_input_name").keyup(function() {
    var cid = highlighted_cell.model.cid;
    var entry = highlighted_cell.attributes()["data-type"] == "erd.Entity" ? _e[cid] : _r[cid];
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

    }

}

function onUnselect() {
    $("#ctrl_delete").removeClass("red").addClass("disabled brown");
    $(".ctrl_entitytype").css("visibility", "hidden").hide();
    $(".ctrl_relationship").css("visibility", "hidden").hide();
    $(".ctrl_attribute").css("visibility", "hidden").hide();
    $("#ctrl_input_name").val("");
}