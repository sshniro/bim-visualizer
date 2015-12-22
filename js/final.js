
$(function()
{
    var o = this;
    var objCount = 0;

    /* Identifier for highlighting one object when rendering */
    var nodeId = null;
    o.server = null;

    /* Configuration parameter to specify Scene Js Location */
    SceneJS.configure({ pluginPath: "lib/scenejs/plugins" });

    /* Connects to the server and loads the BIM Server API */
    connect(serverUrl,username,pass);

    /* Function is used to retrieves the url parameters (productId and revisonId )*/
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

    function loadQueryProjects(projects,projectIds,revisionIds){
        projects.forEach(function(project){
            if(project.lastRevisionId != -1)
            {
                var parentId = project.parentId;
                /* If parent id is -1 its a main project so replace with # for the js tree */
                if(parentId == -1){
                    parentId = "#";
                }

                for(var i=0;i<projectIds.length;i++){
                    var pId = parseInt(project.oid );
                    if(projectIds[i] == pId){
                        /* Add it to the json structure */
                        project.lastRevisionId = revisionIds[i];

                        /* Set the project structure to the json tree */
                        jsonTree['core']['data'].push({'id': project.oid, 'parent' : parentId,'data':project,'type':'project', 'name' :project.name ,
                            "text":project.name + '&nbsp; <button  type="button" class="btn btn-default btn-xs treeButton"  align="right" data-id="'
                            + project.oid +'" aria-label="Right Align"><span class="fa fa-eye" aria-hidden="true"></span> </button>',
                            "icon":"fa fa-home"});
                        jsonData['core']['data'].push({'id': project.oid, 'parent' : parentId, "text":project.name,'name' :project.name ,'data':project,'type':'project'});

                    }
                }
            }
        });
    }



    function showSelectProject() {
        bimServerApi.call("Bimsie1ServiceInterface", "getAllProjects", {onlyActive: true, onlyTopLevel: false}, function(projects){
            /* Read the parameters from the URL provided */
            var projectId = getUrlParamValue("projectId");
            var revisionId = getUrlParamValue("revisionId");

            //If the attribute is not empty then load the project
            if(projectId != ""){

                // Split the string by commas
                var projectIds = projectId.split(",");
                var revisionIds = revisionId.split(",");

                // Check if the project id and the revision id length are the same
                    // if not put an alert and load all the projects
                if(projectIds.length == revisionIds.length){
                    // parse all project ids and revision ids
                    // if any exception occurs alert and load all projects
                    for(var i=0;i<projectIds.length;i++){
                        projectIds[i] = parseInt(projectIds[i]);
                        revisionIds[i] = parseInt(revisionIds[i]);
                    }

                    loadQueryProjects(projects,projectIds,revisionIds);

                }else{
                    alert("query parameter specified is incorrect");
                }

                //projectId = parseInt(projectId);
                //setAllRelatedProjects(projects,projectId);
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
                        jsonTree['core']['data'].push({'id': project.oid, 'parent' : parentId,'data':project,'type':'project', 'name' :project.name ,
                            "text":project.name + '&nbsp; <button  type="button" class="btn btn-default btn-xs treeButton"  align="right" data-id="'
                            + project.oid +'" aria-label="Right Align"><span class="fa fa-eye" aria-hidden="true"></span> </button>',
                            "icon":"fa fa-home"});
                        jsonData['core']['data'].push({'id': project.oid, 'parent' : parentId, "text":project.name,'name' :project.name ,'data':project,'type':'project'});
                    }
                });
            }

            /* Initiate the json tree drawing */
            $('#treeViewDiv').jstree(jsonTree);
        });
    }

    $("#treeViewDiv").on('click', '.treeButton', function(){

        /* HighLight the object in the Canvas */
        var type = $(this).data('type');
        var id = $(this).data('id');
        var state = $(this).data('state');

        /*  Toggle the ifcElement Visisbility  */
        if(type == "ifcElement"){

            var sceneNode = viewer.scene.findNode($(this).data('id'));
            if(sceneNode != null){

                sceneNode.nodeId = sceneNode.id;

                if(state == true){
                    sceneNode.findParentByType("enable").setEnabled(false);
                    $(this).data('state',"false");
                    $(this).find('span')
                        .removeClass('fa-eye')
                        .addClass('fa-eye-slash');
                }else{
                    sceneNode.findParentByType("enable").setEnabled(true);
                    $(this).data('state',true);
                    $(this).find('span')
                        .removeClass('fa-eye-slash')
                        .addClass('fa-eye');
                }

            }
        }else if(type == "ifcType"){
            var childElements = getAllChildElements(id);
            if(state == true){
                hideElements(childElements);
                $(this).data('state',"false");
                $(this).find('span')
                    .removeClass('fa-eye')
                    .addClass('fa-eye-slash');
            }else{
                showElements(childElements);
                $(this).data('state',true);
                $(this).find('span')
                    .removeClass('fa-eye-slash')
                    .addClass('fa-eye');

            }
        }else if(type == 'buildingStorey'){
            // Get All Types initially
            toggleBuildingStorey(id,state,this);
        }else if(type == "IfcBuilding"){
            // get all Ifc Storeys
            toggleBuildingVisibility(id,state,this);
        }else if(type == "IfcSite"){
            toggleIfcSiteVisibility(id,state,this);
        }else if(type == "IfcProject"){
            toggleProjectVisibility(id,state,this);
        }
    });



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

                        /* If the selected node is a project load the project in the canvas */
                        if(jsonData['core']['data'][i]['type'] == "project" ){
                            refreshTree();
                            var projectLoaded = false;
                            // check if this project is already loaded in the canvas
                            for(var k=0;k<loadedProjects.length;k++){
                                if(obj.id == loadedProjects[k])
                                    projectLoaded = true;
                            }

                            if(!projectLoaded){
                                loadedProjects.push(obj.id);
                                loadProject(jsonTree['core']['data'][i]['data'],obj.id);
                            }
                        }

                        /* If the selected node is a IfcBuildingStorey set the slider positions */
                        if(jsonData['core']['data'][i]['type'] == "buildingStorey" ){
                            //set slider posistion
                            setSliderPositions(jsonData['core']['data'][i]['id']);
                        }

                        /* If the selected node is a IfcBuildingStorey set the slider positions */
                        if(jsonData['core']['data'][i]['type'] == "ifcElement" ){
                            //set slider posistion
                            setOpacitySliderPosition();
                        }

                        //var selectedNode = {'id':jsonData['core']['data'][i]['id']};
                        nodeSelected1(jsonData['core']['data'][i]['id']);

                        /* Add the selected node name to the slider text */
                        $('#selectedNode').html(jsonData['core']['data'][i]['text']);
                        /* HighLight the object in the Canvas */
                        var sceneNode = viewer.scene.findNode(jsonData['core']['data'][i]['id']);
                        if(sceneNode != null){
                            sceneNode.nodeId = sceneNode.id;
                            viewer.getControl("BIMSURFER.Control.ClickSelect").pick(sceneNode);
                        }

                        /* Create the pop up dialog box */
                        if(showInfoBox){
                            addDataToDetails(i);
                        }

                        return;
                    }
                }
            }
            /* If the node selected is more than one */
            else if(data.selected.length != 0 && data.selected.length != 1 ){
            }
        }

    });

    function connect(server, email, password) {
        loadBimServerApi(server, null, function(bimServerApi1){
            bimServerApi = bimServerApi1;
            bimServerApi.login(email, password, false, function(){
                // $(dialog).dialog('close');
                viewer = new BIMSURFER.Viewer(bimServerApi, 'viewport');
                resize();

                viewer.loadScene(function(){
                    var clickSelect = viewer.getControl("BIMSURFER.Control.ClickSelect");
                    clickSelect.activate();
                    clickSelect.events.register('select', o.nodeSelected);
                    clickSelect.events.register('unselect', o.nodeUnselected);
                });

                showSelectProject();
            });
        });
    }

    function resize(){
        $("#viewport").width($('#full_screen').width() + "px");
        $("#viewport").height(($(window).height()) + "px");
        $("#viewport").css("width", $('#full_screen').width() + "px");
        $("#viewport").css("height", ($(window).height()) + "px");
        viewer.resize($('div#viewport').width(), $('div#viewport').height());
    }

    /* Queries the model to retrieve the has contains elemements attribute */
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

        o.model.query(preLoadQuery, function(loaded){}).done(function(){
            setTimeout(function(){
                /* To Do add some flags to optimize the code */
                promise.fire();
            }, 0);
        });
        return promise;
    };

    function loadProject(project,nodeId) {
        o.model = bimServerApi.getModel(project.oid, project.lastRevisionId, project.schema, false, function(model){
            var modelAlreadyExists= false;
            for(var i =0 ; i< ifcModel['data'].length ; i++){
                if(model.poid == ifcModel['data'][i]['poid'] && model.riod == ifcModel['data'][i]['roid'])
                    modelAlreadyExists = true;
            }
            if(!modelAlreadyExists){
                ifcModel['data'].push(model);
            }
            model.getAllOfType("IfcProject", true, function(project){
            ifcProject = project;
            });
        });

        bimServerApi.call("ServiceInterface", "getRevisionSummary", {roid: project.lastRevisionId}, function(summary){
            summary.list.forEach(function(item){
                if (item.name == "IFC Entities") {
                    var toLoad = {};

                    item.types.forEach(function(type){
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

                    /* Get the Node Id to be selected */
                    var nodeIda = getUrlParamValue("nodeId");

                    var geometryLoader = new GeometryLoader(bimServerApi, models, viewer , nodeIda);
                    geometryLoader.setLoadTypes(project.lastRevisionId, project.schema, toLoad);
                    viewer.loadGeometry(geometryLoader);

                    queryModel().done(function(){
                        loadTheTree(ifcProject,nodeId,ifcProject.oid);
                    });
                }
            });
        });
        }

    // Build the Decomposed Tree
    function buildTree(object,parent,node){

        var name = null;
        if (object.getLongName != null) {
            if (object.getLongName() != null && object.getLongName() != "") {
                name = object.getLongName();
            }
        }
        if (name == null) {
            if (object.getName() != null && object.getName() != "") {
                name = object.getName();
            }
        }
        if (name == null) {
            name = "Unknown";
        }

        var type = object.getType();
        var parentId = parent;



        if(type == "IfcSpace"){
            ///* TODO replace with promise */
            var testId = parentId + type;
            var obId = object.oid;

            var nodeExists = false;
            /* Check if the type is already created */
            for(var i=0;i<jsonTree['core']['data'].length;i++){
                var jsonObj = jsonTree['core']['data'][i];
                if(jsonObj.id == testId){
                    nodeExists = true;
                    break;
                }
            }
            // If the type node does not exist (ifcSpace) create the ifc space node
            if(!nodeExists){
                //jsonTree['core']['data'].push({'id':parentId, 'parent' : parent, "text":type + '&nbsp; <button type="button" class="btn btn-default btn-xs" aria-label="Right Align" onclick="hideTheElement(' + parentId + ')"><span class="fa fa-eye" aria-hidden="true"></span> </button>' , "type" : "ifcType" ,"icon":"fa fa-gear"});

                jsonTree['core']['data'].push({'id': testId, 'parent' : parent,"type" : "ifcType", 'name' : type,
                    "text": type + '&nbsp; <button  type="button" class="btn btn-default btn-xs treeButton" data-id="'
                    + testId +'" " data-state="true" data-type="ifcType" aria-label="Right Align"><span class="fa fa-eye" aria-hidden="true"></span> </button>',
                    "icon":"fa fa-sort-amount-desc"});

                jsonData['core']['data'].push({'id':testId, 'parent' : parent, "text":type, "type" : "ifcType" , "icon":"fa fa-gear"});
            }

            jsonTree['core']['data'].push({'id': obId, 'parent' : testId,"type" : "ifcElement", 'baseType' : "ifcSpace" , 'name' : type,
                "text": name + '&nbsp; <button  type="button" class="btn btn-default btn-xs treeButton" data-id="'
                + obId +'" data-state="true" data-type="ifcElement" aria-label="Right Align"><span class="fa fa-eye" aria-hidden="true"></span> </button>',
                "icon":"fa fa-circle"});

            jsonData['core']['data'].push({'id':obId, 'parent' : testId, "type" : "ifcElement" , 'baseType' : "ifcSpace" ,'name' : type, "text":name,'data':object.object,"icon":"fa fa-circle"})


            object.getContainsElements(function(relReferencedInSpatialStructure) {
                relReferencedInSpatialStructure.getRelatedElements(function (relatedElement) {

                    // get the id of parent
                    var nodeExists = false;
                    var parent = object.oid;
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
                        //jsonTree['core']['data'].push({'id':parentId, 'parent' : parent, "text":type + '&nbsp; <button type="button" class="btn btn-default btn-xs" aria-label="Right Align" onclick="hideTheElement(' + parentId + ')"><span class="fa fa-eye" aria-hidden="true"></span> </button>' , "type" : "ifcType" ,"icon":"fa fa-gear"});

                        jsonTree['core']['data'].push({'id': parentId, 'parent' : parent,"type" : "ifcType", 'name' : type,
                            "text": type + '&nbsp; <button  type="button" id="'+parentId+'" class="btn btn-default btn-xs treeButton" data-id="'
                            + parentId +'" " data-state="true" data-type="ifcType" aria-label="Right Align"><span class="fa fa-eye" aria-hidden="true"></span> </button>',
                            "icon":"fa fa-sort-amount-desc"});

                        jsonData['core']['data'].push({'id':parentId, 'parent' : parent, 'name' : type, "text":type, "type" : "ifcType" , "icon":"fa fa-gear"});
                    }
                    //if the node exists do not append to the json tree

                    /* TODO replace with promise */
                    objCount++;
                    // Now add the object to the tree
                    //jsonTree['core']['data'].push({'id':objId, 'parent' : parentId, "type" : "ifcElement" , "text":name + '&nbsp; <button type="button" class="btn btn-default btn-xs" aria-label="Right Align" onclick="hideTheElement('+ objId + ')"><span class="fa fa-eye" aria-hidden="true"></span> </button>' ,"icon":"fa fa-circle"});

                    jsonTree['core']['data'].push({'id': objId, 'parent' : parentId,"type" : "ifcElement", 'name' : name,
                        "text": name + '&nbsp; <button  type="button" class="btn btn-default btn-xs treeButton" data-id="'
                        + objId +'" data-state="true" data-type="ifcElement" aria-label="Right Align"><span id="'+objId+'" class="fa fa-eye" aria-hidden="true"></span> </button>',
                        "icon":"fa fa-circle"});

                    jsonData['core']['data'].push({'id':objId, 'parent' : parentId, "type" : "ifcElement" , 'name' : name, "text":name,"icon":"fa fa-circle",'data':relatedElement.object})

                })
            });
            return;
        }

        if(type == "IfcBuildingStorey"){
            (function (obj){

                var id = obj.oid;

                jsonTree['core']['data'].push({'id': id, 'parent' : parentId,"type" : "buildingStorey", 'name' : name,
                    "text":name + '&nbsp; <button  type="button" class="btn btn-default btn-xs treeButton" data-id="'
                    + id +'" " data-state="true" data-type="buildingStorey" aria-label="Right Align"><span class="fa fa-eye" aria-hidden="true"></span> </button>',
                    "icon":"fa fa-sort-amount-desc"});


                jsonData['core']['data'].push({'id':id, 'parent' : parentId, "text":name, 'name' : name, "type" : "buildingStorey",
                                                "icon":"fa fa-sort-amount-desc"});
                /* TODO replace with promise */

                obj.getContainsElements(function(relReferencedInSpatialStructure) {
                    relReferencedInSpatialStructure.getRelatedElements(function (relatedElement) {

                        // get the id of parent
                        var nodeExists = false;
                        var parent = obj.oid;
                        var type = relatedElement.getType();
                        var name = relatedElement.getName();

                        if(type == "IfcStair"){
                            console.log("ifcStair")
                        }

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
                            //jsonTree['core']['data'].push({'id':parentId, 'parent' : parent, "text":type + '&nbsp; <button type="button" class="btn btn-default btn-xs" aria-label="Right Align" onclick="hideTheElement(' + parentId + ')"><span class="fa fa-eye" aria-hidden="true"></span> </button>' , "type" : "ifcType" ,"icon":"fa fa-gear"});

                            jsonTree['core']['data'].push({'id': parentId, 'parent' : parent,"type" : "ifcType", 'name' : type,
                                "text": type + '&nbsp; <button  type="button" id="'+parentId+'" class="btn btn-default btn-xs treeButton" data-id="'
                                + parentId +'" " data-state="true" data-type="ifcType" aria-label="Right Align"><span class="fa fa-eye" aria-hidden="true"></span> </button>',
                                "icon":"fa fa-sort-amount-desc"});

                            jsonData['core']['data'].push({'id':parentId, 'parent' : parent, 'name' : type, "text":type, "type" : "ifcType" , "icon":"fa fa-gear"});
                        }
                        //if the node exists do not append to the json tree

                        /* TODO replace with promise */
                        objCount++;
                        // Now add the object to the tree
                        //jsonTree['core']['data'].push({'id':objId, 'parent' : parentId, "type" : "ifcElement" , "text":name + '&nbsp; <button type="button" class="btn btn-default btn-xs" aria-label="Right Align" onclick="hideTheElement('+ objId + ')"><span class="fa fa-eye" aria-hidden="true"></span> </button>' ,"icon":"fa fa-circle"});

                        jsonTree['core']['data'].push({'id': objId, 'parent' : parentId,"type" : "ifcElement", 'name' : name,
                            "text": name + '&nbsp; <button  type="button" class="btn btn-default btn-xs treeButton" data-id="'
                            + objId +'" data-state="true" data-type="ifcElement" aria-label="Right Align"><span id="'+objId+'" class="fa fa-eye" aria-hidden="true"></span> </button>',
                            "icon":"fa fa-circle"});

                        jsonData['core']['data'].push({'id':objId, 'parent' : parentId, "type" : "ifcElement" , 'name' : name, "text":name,"icon":"fa fa-circle",'data':relatedElement.object})


                        relatedElement.getIsDecomposedBy(function(isDecomposedBy){
                            isDecomposedByVar = isDecomposedBy;
                            isDecomposedBy.getRelatedObjects(function(relatedObject){
                                buildTree(relatedObject,objId,relatedObject.oid);
                            });
                        });
                    })
                });

            }(object));
        }

        if(type != "IfcBuildingStorey"){
            //jsonTree['core']['data'].push({'id': node, 'parent' : parent, "text":name + '&nbsp; <button type="button" class="btn btn-default btn-xs" aria-label="Right Align" onclick="hideTheElement('+node+')"><span class="fa fa-eye" aria-hidden="true"></span> </button>',"icon":"fa fa-sort-amount-desc"});

            jsonTree['core']['data'].push({'id': node, 'parent' : parent,"type" : type, 'name' : name,
                "text": name + '&nbsp; <button  type="button" class="btn btn-default btn-xs treeButton" data-id="'
                + node +'" data-state="true" data-type="'+type+'" " aria-label="Right Align"><span class="fa fa-eye" aria-hidden="true"></span> </button>',
                "icon":"fa fa-sort-amount-desc"});

            jsonData['core']['data'].push({'id':node, 'parent' : parent, "text":name, 'name' : name, "icon":"fa fa-circle",'data':object.object});
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

    function nodeUnselected(node) {
        $("#object_info table tbody tr").remove();
    }
});
