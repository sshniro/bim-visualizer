function toggleProjectVisibility(id,state,selectedDiv){
    if(state == true){
        $(selectedDiv).data('state',"false");
        $(selectedDiv).find('span')
            .removeClass('fa-eye')
            .addClass('fa-eye-slash');
    }else{
        $(selectedDiv).data('state',true);
        $(selectedDiv).find('span')
            .removeClass('fa-eye-slash')
            .addClass('fa-eye');
    }

    var sites = getAllChildElements(id);
    for(var i=0;i<sites.length;i++){
        toggleIfcSiteVisibility(sites[i],state,selectedDiv);
        var buildings = getAllChildElements(sites[i]);
        for(var j=0;j<buildings.length;j++){
            toggleBuildingVisibility(buildings[j],state,selectedDiv);
        }
    }
}

function toggleIfcSiteVisibility(id,state,selectedDiv){
    if(state == true){
        $(selectedDiv).data('state',"false");
        $(selectedDiv).find('span')
            .removeClass('fa-eye')
            .addClass('fa-eye-slash');
    }else{
        $(selectedDiv).data('state',true);
        $(selectedDiv).find('span')
            .removeClass('fa-eye-slash')
            .addClass('fa-eye');
    }

    var sceneNode = viewer.scene.findNode(id);
    if(sceneNode != null){

        sceneNode.nodeId = sceneNode.id;

        if( state == true ){
            sceneNode.findParentByType("enable").setEnabled(false);
            $(selectedDiv).data('state',"false");
        }else{
            sceneNode.findParentByType("enable").setEnabled(true);
            $(selectedDiv).data('state',true);
        }

    }
}

function toggleBuildingVisibility(id,state,selectedDiv){
    if(state == true){
        $(selectedDiv).data('state',"false");
        $(selectedDiv).find('span')
            .removeClass('fa-eye')
            .addClass('fa-eye-slash');
    }else{
        $(selectedDiv).data('state',true);
        $(selectedDiv).find('span')
            .removeClass('fa-eye-slash')
            .addClass('fa-eye');
    }
    // get all Ifc Storeys
    var storeys = getAllChildElements(id);
    if(state== true){
        for(var k=0;k<storeys.length;k++){
            var types = getAllChildElements(storeys[k]);
            for(var j=0; j< types.length;j++){
                //var childElements = getAllChildElements(types[j])
                var childElements = [];
                childElements = getAllChildElements1(types[j],childElements);
                hideElements(childElements);
            }
        }
        $(selectedDiv).data('state',"false");
    }else{
        for(var k=0;k<storeys.length;k++){
            var types = getAllChildElements(storeys[k]);
            for(var j=0; j< types.length;j++){
                //var childElements = getAllChildElements(types[j])
                var childElements = [];
                childElements = getAllChildElements1(types[j],childElements);
                showElements(childElements);
            }
        }
        $(selectedDiv).data('state',true);
    }
}

function toggleBuildingStorey(id,state,selectedDiv){
    // Get All Types initially
    var types = getAllChildElements(id);
    if(state == true){
        for(var j=0; j< types.length;j++){
            //var childElements = getAllChildElements(types[j])
            var childElements = [];
            childElements = getAllChildElements1(types[j],childElements);
            hideElements(childElements);
        }
        $(selectedDiv).data('state',"false");
    }else{
        for(var j=0; j< types.length;j++){
            //var childElements = getAllChildElements(types[j])
            var childElements = [];
            childElements = getAllChildElements1(types[j],childElements);
            showElements(childElements);
        }
        $(selectedDiv).data('state',true);
    }
}

function hideElements(childElements){
    for(var i=0;i<childElements.length;i++){

        var childId = childElements[i];
        var sceneNode = viewer.scene.findNode(childId);

        if(sceneNode != null){
            sceneNode.nodeId = sceneNode.id;
            sceneNode.findParentByType("enable").setEnabled(false);

            $('#treeViewDiv').find('#'+ childId +'').find('span')
                .removeClass('fa-eye')
                .addClass('fa-eye-slash');
        }
    }
}

function showElements(childElements){
    for(var i=0;i<childElements.length;i++){

        var childId = childElements[i];
        var sceneNode = viewer.scene.findNode(childId);

        if(sceneNode != null){
            sceneNode.nodeId = sceneNode.id;
            sceneNode.findParentByType("enable").setEnabled(true);

            $('#treeViewDiv').find('#'+ childId +'').find('span')
                .removeClass('fa-eye-slash')
                .addClass('fa-eye');
        }
    }
}

function getAllChildElements(parent){
    var childElements = [];
    for(var i = 0; i < jsonTree['core']['data'].length; i++) {
        var obj = jsonTree['core']['data'][i];
        if(obj.parent == parent){
            childElements.push(obj.id);
        }
    }
    //console.log(childElements);
    return childElements;
}

function getAllChildElements1(parent,childElements){
    //var childElements = [];
    for(var i = 0; i < jsonTree['core']['data'].length; i++) {
        var obj = jsonTree['core']['data'][i];
        if(obj.parent == parent){
            childElements.push(obj.id);
            getAllChildElements1(obj.id,childElements,true);

        }

    }
    //console.log(childElements);
    return childElements;
}