/* Reset the credentials with the server credentials */
/* Credentials set to the local host */
var serverUrl = "http://localhost:8080/";
var username = "admin@bimserver.org";
var pass = "admin";


///* Credentials set to the Remote Server uncomment to load from server */
//var serverUrl = "https://52.74.66.119:9451/bim";
//var username = "admin@bimserver.org";
//var pass = "admin";

/* Global Variable to access the bim server api */
var bimapi;

// More global Variables
//TODO more comments on the variables
var selectedNode;
var jsonData = {
    "core": {
        "data": []
    }
};
var jsonTree = {
    "core" : {
        'data' : []
    }
    //,"checkbox" : {
    //    "keep_selected_style" : false
    //    //"whole_node" : false
    //    //"three_state" : true,
    //    //"tie_selection" : false
    //}
    //,"plugins" : [ "checkbox" ]
};
var hiddenElements=[];
var toggleSwitch = false;
var loadedProjects = [];

// buildingStorey
// IfcType
function helloWorld(node){
    alert(node);
}

function showProperty1 (propertySet, property, headerTr, editable){
    var tr = $("<tr></tr>");
    tr.attr("oid", property.oid);
    tr.attr("psetoid", propertySet.oid);
    headerTr.after(tr);
    if (property.changedFields != null && (property.changedFields["NominalValue"] || property.changedFields["Name"])) {
        tr.addClass("warning");
    }

    tr.append("<td>" + property.object.Name + "</td>");
    getValue1(tr, property, editable);
}

function showProperties1(propertySet, headerTr) {
    propertySet.getHasProperties(function(property){
        if (property.object._t == "IfcPropertySingleValue") {
            showProperty1(propertySet, property, headerTr);
        }
    });
}

function showPropertySet1(propertySet) {
    var headerTr = $("<tr class=\"active\"></tr>");
    headerTr.attr("oid", propertySet.oid);
    headerTr.attr("uri", propertySet.object.Name);
    if (propertySet.changedFields != null && propertySet.changedFields["Name"]) {
        headerTr.addClass("warning");
    }
    $("#object_info table tbody").append(headerTr);
    var headerTd = $("<td></td>");
    headerTr.append(headerTd);

    headerTd.append("<b>" + propertySet.object.Name + "</b>");
    showProperties1(propertySet, headerTr);
}

function getValue1(tr, property, editable) {
    (function (tr) {
        property.getNominalValue(function(value){
            var td = $("<td>");
            var v = value == null ? "" : value._v;
            var span = $("<span class=\"value nonEditable\">" + v + "</span>");
            td.append(span);
            tr.append(td);
        });
    } )(tr);
}

function nodeSelected1(node) {
    $("#object_info table tbody tr").remove();
    if (node.id != null) {
        ifcModel.get(node.id, function(product){
            if(product != null){
                if (product.oid == node.id) {
                    var tr = $("<tr></tr>");
                    tr.append("<b>" + product.object._t + "</b>");
                    if (product.object.Name != null) {
                        tr.append("<b>" + product.object.Name + "</b>");
                    }
                    $("#object_info table tbody").append(tr);
                    product.getIsDefinedBy(function(isDefinedBy){
                        if (isDefinedBy.object._t == "IfcRelDefinesByProperties") {
                            isDefinedBy.getRelatingPropertyDefinition(function(propertySet){
                                if (propertySet.object._t == "IfcPropertySet") {
                                    showPropertySet1(propertySet);
                                }
                            });
                        }
                    });
                }
            }
        });
    }
}

function nodeUnselected1(node) {
    $("#object_info table tbody tr").remove();
}