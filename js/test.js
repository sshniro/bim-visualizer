
$(function()
{
    var o = this;
    var objCount = 0;

    o.server = null;
    o.viewer = null;
    o.bimServerApi = null;

    SceneJS.configure({ pluginPath: "lib/scenejs/plugins" });

    /* Connects to the server and loads the BIM Server API */
    connect(serverUrl,username,pass);

    /* Function is used to retreives the url parameters (productId and revisonId )*/
    function getUrlParamValue(name){
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function setAllRelatedProjects(projects,projectId){

        projects.forEach(function(project){
            if(project.lastRevisionId != -1)
            {
                var parentId = project.parentId;
                /* If parent id is -1 its a main project so replace with # for the js tree */
                if(parentId == -1){
                    parentId = "#";
                }

                //var id = parseInt(projectId);
                var pId = parseInt(project.oid );
                if( id === pId){
                    /* Set the project structure to the json tree */
                    //var subProjects = project.subProjects;
                    var length = project.subProjects.length
                    jsonTree['core']['data'].push({'id': project.oid, 'parent' : parentId, "text":project.name,'data':project,"icon":"fa fa-home"});
                    jsonData['core']['data'].push({'id': project.oid, 'parent' : parentId, "text":project.name,'data':project,'isProject':true});

                    if( length != 0 ){
                        /* Again loop through all the elements to get the sub projects */
                        for(var j =0 ; j < length ; j++){
                            setAllRelatedProjects(projects,project.subProjects[j]);
                        }
                    }
                }
            }
        });
    }

    function showSelectProject() {
        o.bimServerApi.call("Bimsie1ServiceInterface", "getAllProjects", {onlyActive: true, onlyTopLevel: false}, function(projects){
            /* Read the parameters from the URL provided */
            var projectId = getUrlParamValue("projectId");

            //If the attribute is not empty then load the project
            if(projectId != ""){
                projectId = parseInt(projectId);
                setAllRelatedProjects(projects,projectId);
            }else{
                /* TODO Add an alert if no project Id is given  */
                projects.forEach(function(project){
                    if(project.lastRevisionId != -1)
                    {
                        var parentId = project.parentId;
                        /* If parent id is -1 its a main project so replace with # for the js tree */
                        if(parentId == -1){
                            parentId = "#";
                        }

                        /* Set the project structure to the json tree */
                        jsonTree['core']['data'].push({'id': project.oid, 'parent' : parentId, "text":project.name,'data':project,"icon":"fa fa-home"});
                        jsonData['core']['data'].push({'id': project.oid, 'parent' : parentId, "text":project.name,'data':project,'isProject':true});
                    }
                });
            }

            /* Initiate the json tree drawing */
            $('#treeViewDiv').jstree(jsonTree);
        });
    }

    /* If the tree node is selected */
    $('#treeViewDiv').on("changed.jstree", function (e, data) {

        if(process){
            console.log(data.selected);
            /* If the node selected is zero */
            if(data.selected.length == 0){
                return;
            }
            /* If the node selected is only one */
            else if(data.selected.length == 1 ){
                /* Find the node of the project selected */
                for(var i = 0; i < jsonTree['core']['data'].length; i++) {
                    var obj = jsonTree['core']['data'][i];
                    if(data.selected == obj.id){
                        if(jsonData['core']['data'][i]['isProject'] == true)
                            loadProject(jsonTree['core']['data'][i]['data'],obj.id);

                        /* TODO open only once  */
                        $("#tenant").dialog("open");
                        var div = $('#tenant_details');
                        div.empty();

                        for (var key in jsonData['core']['data'][i]) {
                            if (jsonData['core']['data'][i].hasOwnProperty(key)) {
                                div.append('<p>'+ key + ' -> '+ jsonData['core']['data'][i][key] + '</p>')
                            }
                        }
                        var selectedNode = {'id':jsonData['core']['data'][i]['id']};
                        nodeSelected(selectedNode);

                        /* HighLight the object in the Canvas */
                        var sceneNode = o.viewer.scene.findNode(jsonData['core']['data'][i]['id']);
                        if(sceneNode != null){

                            sceneNode.nodeId = sceneNode.id;
                            o.viewer.getControl("BIMSURFER.Control.ClickSelect").pick(sceneNode);
                        }

                        return;
                    }
                }
            }
            /* If the node selected is more than one */
            else if(data.selected.length != 0 && data.selected.length != 1 ){
                /* Iterate through all the Json Tree Nodes */
                for(var k=0; k< jsonTree['core']['data'].length ; k++){
                    /* Iterate through all the Selected Json Tree Nodes */
                    for(var j=0 ; j<data.selected.length ; j++){

                        var jsTreeData = jsonTree['core']['data'][k]['id'];
                        var selectedData = data.selected[j];

                        /* Get all the nodes which are not selected */
                        if(selectedData == jsTreeData ){
                            break;
                            //hiddenElements.push(data.selected[j]);
                        }
                        if(j == (data.selected.length -1)){
                            /* Add to the elements to hide only if it TYPE is a json Element */
                            if(jsonTree['core']['data']['type'] == "ifcElement")
                                hiddenElements.push(data.selected[j]);
                        }
                    }
                }

                // Hide all the elements which are not selected
                //getHiddenElements(data.selected);
            }
        }

    });

    function connect(server, email, password) {
        loadBimServerApi(server, null, function(bimServerApi){
            o.bimServerApi = bimServerApi;
            o.bimServerApi.login(email, password, false, function(){
                // $(dialog).dialog('close');
                o.viewer = new BIMSURFER.Viewer(o.bimServerApi, 'viewport');
                resize();

                o.viewer.loadScene(function(){
                    var clickSelect = o.viewer.getControl("BIMSURFER.Control.ClickSelect");
                    clickSelect.activate();
                    clickSelect.events.register('select', o.nodeSelected);
                    clickSelect.events.register('unselect', o.nodeUnselected);
                });

                showSelectProject();
            });
        });
    }

    function resize(){
        $("#viewport").width($(window).width() + "px");
        $("#viewport").height(($(window).height() - 98) + "px");
        $("#viewport").css("width", $(window).width() + "px");
        $("#viewport").css("height", ($(window).height() - 98) + "px");
        o.viewer.resize($('div#viewport').width(), $('div#viewport').height());
    }

    var queryModel = function () {
        // create a deferred object
        var r = $.Deferred();

        var countingPromise = new CountingPromise();
        var promise = new Promise();

        var preLoadQuery = {
            defines: {
                Representation: {
                    field: "Representation"
                },
                ContainsElementsDefine: {
                    field: "ContainsElements",
                    include: {
                        field: "RelatedElements",
                        include: [
                            "IsDecomposedByDefine",
                            "ContainsElementsDefine",
                            "Representation"
                        ]
                    }
                },
                IsDecomposedByDefine: {
                    field: "IsDecomposedBy",
                    include: {
                        field: "RelatedObjects",
                        include: [
                            "IsDecomposedByDefine",
                            "ContainsElementsDefine",
                            "Representation"
                        ]
                    }
                }
            },
            queries: [
                {
                    type: "IfcProject",
                    include: [
                        "IsDecomposedByDefine",
                        "ContainsElementsDefine"
                    ]
                },
                {
                    type: "IfcRepresentation",
                    includeAllSubtypes: true
                },
                {
                    type: "IfcProductRepresentation"
                },
                {
                    type: "IfcPresentationLayerWithStyle"
                },
                {
                    type: "IfcProduct",
                    includeAllSubTypes: true
                },
                {
                    type: "IfcProductDefinitionShape"
                },
                {
                    type: "IfcPresentationLayerAssignment"
                },
                {
                    type: "IfcRelAssociatesClassification",
                    include: [
                        {
                            field: "RelatedObjects"
                        },
                        {
                            field: "RelatingClassification"
                        }
                    ]
                },
                {
                    type: "IfcSIUnit"
                },
                {
                    type: "IfcPresentationLayerAssignment"
                }
            ]
        };

        ifcModel.query(preLoadQuery, function(loaded){}).done(function(){
            setTimeout(function(){
                /* To Do add some flags to optimize the code */
                promise.fire();
            }, 0);
        });
        return promise;
    };

    function loadProject(project,nodeId) {
        o.model = o.bimServerApi.getModel(project.oid, project.lastRevisionId, project.schema, false, function(model){
            ifcModel = model;
            model.getAllOfType("IfcProject", true, function(project){
                ifcProject = project;
            });
        });

        o.bimServerApi.call("ServiceInterface", "getRevisionSummary", {roid: project.lastRevisionId}, function(summary){
            summary.list.forEach(function(item){
                if (item.name == "IFC Entities") {
                    var toLoad = {};

                    item.types.forEach(function(type){
                        /* get the total count of the IFC Entities */
                        totObjects += type.count;

                        toLoad[type.name] = {mode: 0};
                        if(BIMSURFER.Constants.defaultTypes.indexOf(type.name) != -1) {
                        }
                    });

                    $(window).resize(resize);

                    var models = {};

                    models[project.lastRevisionId] = o.model;
                    for (var key in toLoad) {
                        o.model.getAllOfType(key, true, function(object){
                            object.trans.mode = 0;
                        });
                    }
                    var geometryLoader = new GeometryLoader(o.bimServerApi, models, o.viewer);

                    var progressdiv = $("<div class=\"progressdiv\">");
                    var text = $("<div class=\"text\">");
                    text.html(project.name);
                    var progress = $("<div class=\"progress progress-striped\">");
                    var progressbar = $("<div class=\"progress-bar\">");
                    progressdiv.append(text);
                    progressdiv.append(progress);
                    progress.append(progressbar);

                    //containerDiv.find(".progressbars").append(progressdiv);

                    geometryLoader.addProgressListener(function(progress){
                        progressbar.css("width", progress + "%");
                        if (progress == 100) {
                            progressdiv.fadeOut(800);
                        }
                    });
                    geometryLoader.setLoadTypes(project.lastRevisionId, project.schema, toLoad);
                    o.viewer.loadGeometry(geometryLoader);

                    queryModel().done(function(){
                        loadTheTree(ifcProject,nodeId,ifcProject.oid);
                    });

                    setTimeout(function(){
                        /* To Do add some flags to optimize the code */
                        refreshTree();
                        o.viewer.refreshMask();
                    }, 2000);
                }
            });
        });
    }

    // Build the Decomposed Tree
    function buildTree(object,parent,node){
        var name = object.object['Name'];
        var type = object.getType();
        var parentId = parent;

        if(type == "IfcSpace"){
            ///* TODO replace with promise */
            objCount++;
            console.log(objCount);
            return;
        }

        if(type == "IfcBuildingStorey"){
            (function (obj){

                var name = null;
                if (obj.getLongName != null) {
                    if (obj.getLongName() != null && obj.getLongName() != "") {
                        name = obj.getLongName();
                    }
                }
                if (name == null) {
                    if (obj.getName() != null && obj.getName() != "") {
                        name = obj.getName();
                    }
                }
                if (name == null) {
                    name = "Unknown";
                }

                var id = obj.oid;

                /* Add this building element entry to the Json Tree */
                jsonTree['core']['data'].push({'id':id, 'parent' : parentId, "text":name, "type" : "buildingStorey",
                    "icon":"fa fa-sort-amount-desc"});
                jsonData['core']['data'].push({'id':id, 'parent' : parentId, "text":name, "type" : "buildingStorey",
                    "icon":"fa fa-sort-amount-desc"});
                /* TODO replace with promise */
                objCount++;

                obj.getContainsElements(function(relReferencedInSpatialStructure) {
                    relReferencedInSpatialStructure.getRelatedElements(function (relatedElement) {

                        // get the id of parent
                        var nodeExists = false;
                        var parent = obj.oid;
                        var type = relatedElement.getType();
                        var name = relatedElement.getName();

                        var parentId = parent + type;
                        var objId = relatedElement.oid;


                        /* Check if the type is already created */
                        for(var i=0;i<jsonTree['core']['data'].length;i++){
                            var jsonObj = jsonTree['core']['data'][i];
                            if(jsonObj.id == parentId){
                                nodeExists = true;
                                break;
                            }
                        }
                        // If the node does not exist
                        if(!nodeExists){
                            jsonTree['core']['data'].push({'id':parentId, 'parent' : parent, "text":type, "type" : "ifcType" ,"icon":"fa fa-gear"});
                            jsonData['core']['data'].push({'id':parentId, 'parent' : parent, "text":type, "type" : "ifcType" , "icon":"fa fa-gear"});
                        }
                        //if the node exists do not append to the json tree

                        /* TODO replace with promise */
                        objCount++;
                        // Now add the object to the tree
                        jsonTree['core']['data'].push({'id':objId, 'parent' : parentId, "type" : "ifcElement" , "text":name,"icon":"fa fa-circle"});
                        jsonData['core']['data'].push({'id':objId, 'parent' : parentId, "type" : "ifcElement" , "text":name,"icon":"fa fa-circle",'data':relatedElement.object})

                    })
                });

            }(object));
        }

        if(type != "IfcBuildingStorey"){
            jsonTree['core']['data'].push({'id': node, 'parent' : parent, "text":name,"icon":"fa fa-sort-amount-desc"});
            jsonData['core']['data'].push({'id':node, 'parent' : parent, "text":name,"icon":"fa fa-circle",'data':object.object});
            /* TODO replace with promise */
            objCount++;
        }

        object.getIsDecomposedBy(function(isDecomposedBy){
            isDecomposedByVar = isDecomposedBy;
            isDecomposedBy.getRelatedObjects(function(relatedObject){
                buildTree(relatedObject,node,relatedObject.oid);
            });
        });
    }

    //function loadTheTree(object,parent,node){}
    function loadTheTree(object,parent,node){
        var countingPromise = new CountingPromise();
        var promise = new Promise();
        buildTree(ifcProject,parent,ifcProject.oid);
        return promise;

    }

    function showProperty (propertySet, property, headerTr, editable){
        var tr = $("<tr></tr>");
        tr.attr("oid", property.oid);
        tr.attr("psetoid", propertySet.oid);
        headerTr.after(tr);
        if (property.changedFields != null && (property.changedFields["NominalValue"] || property.changedFields["Name"])) {
            tr.addClass("warning");
        }

        tr.append("<td>" + property.object.Name + "</td>");
        getValue(tr, property, editable);
    }

    function showProperties(propertySet, headerTr) {
        propertySet.getHasProperties(function(property){
            if (property.object._t == "IfcPropertySingleValue") {
                showProperty(propertySet, property, headerTr);
            }
        });
    }

    function showPropertySet(propertySet) {
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
        showProperties(propertySet, headerTr);
    }

    function getValue(tr, property, editable) {
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

    function nodeSelected(node) {
        $("#object_info table tbody tr").remove();
        if (node.id != null) {
            o.model.get(node.id, function(product){
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
                                        showPropertySet(propertySet);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    function nodeUnselected(node) {
        $("#object_info table tbody tr").remove();
    }
});
