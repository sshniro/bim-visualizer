function changeVisibility(inc){
    var nodeId = $("#treeViewDiv").jstree("get_selected");
    var nodeType;
    globalMatrix=[];

    /* Check the node Type */
    for(var i = 0; i < jsonTree['core']['data'].length; i++) {
        var obj = jsonTree['core']['data'][i];

        if(nodeId == obj.id){
            nodeType = jsonData['core']['data'][i]['type'];
            break;
        }
    }

    if(nodeType == "buildingStorey" ){
        // Get All Types initially
        var types = getAllChildElements(nodeId);
        for(var j=0; j< types.length;j++){
            var childElements = [];
            childElements = getAllChildElements1(types[j],childElements);
            for(var k=0;k<childElements.length;k++){

                var childId = childElements[k];
                globalMatrix.push(childId);
                var sceneNode = viewer.scene.findNode(childId);
            }

        }
    }

    allOpacityRendered = false;
    viewer.scene.on("tick",function(){
        if(!allOpacityRendered){
            for(var j=0 ; j< globalMatrix.length ; j++){
                var myMatrix = viewer.scene.findNode(globalMatrix[j]);

                if(myMatrix != null){
                    /* Some weird thing I dont know why */
                    if(myMatrix.nodes[0].type == "material"){
                        myMatrix.nodes[0].setAlpha(inc);
                    }else{
                        myMatrix.parent.setAlpha(inc);
                    }
                }
            }
            allOpacityRendered = true;
        }
    });
};

function move(inc){
    var nodeId = $("#treeViewDiv").jstree("get_selected");
    var nodeType;
    globalMatrix=[];

    /* Check the node Type */
    for(var i = 0; i < jsonTree['core']['data'].length; i++) {
        var obj = jsonTree['core']['data'][i];

        if(nodeId == obj.id){
            nodeType = jsonData['core']['data'][i]['type'];
            break;
        }
    }

    if(nodeType == "buildingStorey" ){
        // Get All Types initially
        var types = getAllChildElements(nodeId);
        for(var j=0; j< types.length;j++){
            var childElements = [];
            childElements = getAllChildElements1(types[j],childElements);
            for(var k=0;k<childElements.length;k++){

                var childId = childElements[k];
                globalMatrix.push(childId);
                var sceneNode = viewer.scene.findNode(childId);
            }

        }
    }

    allRendered = false;
    viewer.scene.on("tick",function(){
        // Put a switch if anything new to be rendered
        if(!allRendered){
            for(var j=0 ; j< globalMatrix.length ; j++){
                var myMatrix = viewer.scene.findNode(globalMatrix[j]);

                if(myMatrix != null){
                    /* Some weird thing I dont know why */
                    if(myMatrix.nodes[0].type == "material"){
                        var modelMatrix  = myMatrix.nodes[0].nodes[0].getModelMatrix();
                        modelMatrix[13] += inc;
                        myMatrix.nodes[0].nodes[0].setElements(modelMatrix);
                    }else{
                        var modelMatrix  = myMatrix.nodes[0].getModelMatrix();
                        modelMatrix[13] += inc;
                        myMatrix.nodes[0].setElements(modelMatrix);
                    }
                }
            }
            allRendered = true;
        }
    });
}

function getAllChildElements(parent){
    var childElements = [];
    for(var i = 0; i < jsonTree['core']['data'].length; i++) {
        var obj = jsonTree['core']['data'][i];
        if(obj.parent == parent){
            childElements.push(obj.id);
        }
    }
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

function setSliderPositions(){
    if(sliderPositions.storeys.length == 0){
        for(var i = 0; i < jsonTree['core']['data'].length; i++) {
            if(jsonTree['core']['data'][i]['type'] == "buildingStorey"){
                var pos = {
                    id : jsonTree['core']['data'][i]['id'],
                    pos : 0,
                    prevSliderVal : 0,
                    opacityVal : 1
                };
                sliderPositions.storeys.push(pos);
            }
        }
    }else{
        var nodeId = $("#treeViewDiv").jstree("get_selected");
        var existingBuildingStorey = false;
        for(var i = 0; i < sliderPositions.storeys.length; i++) {
            if(nodeId == sliderPositions.storeys[i]['id']){
                sliderSwitch = false;
                slider.noUiSlider.set([sliderPositions.storeys[i]['prevSliderVal']]);
                $('#xSliderVal').html("Value : " +sliderPositions.storeys[i]['prevSliderVal']);
                sliderSwitch = true;


                opacitySliderSwitch = false;
                opacitySlider.noUiSlider.set([sliderPositions.storeys[i]['opacityVal']]);
                $('#opacitySliderVal').html("Value : " +sliderPositions.storeys[i]['opacityVal']);
                opacitySliderSwitch = true;

                existingBuildingStorey = true;
                break;
            }
        }

        /* A new building has been loaded so add those building storeys to the slider*/
        if(!existingBuildingStorey){
            for(var i = 0; i < jsonTree['core']['data'].length; i++) {
                if(jsonTree['core']['data'][i]['type'] == "buildingStorey"){

                    var nodeExists = false;

                    for(var j = 0; j < sliderPositions.storeys.length; j++) {
                        if(sliderPositions.storeys[j]['id'] == jsonTree['core']['data'][i]['id']){
                            nodeExists = true;
                            break;
                        }
                    }

                    if(!nodeExists){
                        var pos = {
                            id : jsonTree['core']['data'][i]['id'],
                            pos : 0,
                            prevSliderVal : 0
                        };
                        sliderPositions.storeys.push(pos);
                    }
                }
            }
            sliderSwitch = false;
            slider.noUiSlider.set([0]);
            $('#xSliderVal').html("Value : " + 0);
            sliderSwitch = true;

            opacitySliderSwitch = false;
            opacitySlider.noUiSlider.set([1]);
            $('#opacitySliderVal').html("Value : " + 0);
            opacitySliderSwitch = true;
        }

    }
}

function setOpacitySliderPosition(id){
    var myMatrix = viewer.scene.findNode(id);

    if(myMatrix != null){
        var alpha = 1;
        /* Some weird thing I dont know why */
        if(myMatrix.nodes[0].type == "material"){
            alpha = myMatrix.nodes[0].getAlpha();
        }else{
            alpha = myMatrix.parent.getAlpha();
        }

        opacitySliderSwitch = false;
        opacitySlider.noUiSlider.set([alpha]);
        $('#opacitySliderVal').html("Value : " + alpha);
        opacitySliderSwitch = true;
    }
}
