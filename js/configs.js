/* Reset the credentials with the server credentials */
/* Credentials set to the local host */
var serverUrl = "http://localhost:8080/";
var username = "admin@bimserver.org";
var pass = "admin";


///* Credentials set to the Remote Server uncomment to load from server */
//var serverUrl = "http://localhost:8080/";
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

// buildingStorey
// IfcType
