$(function () {
    var to = false;
    $('#jsTreeSearch').keyup(function () {
        if(to) { clearTimeout(to); }
        to = setTimeout(function () {
            var v = $('#jsTreeSearch').val();
            $('#treeViewDiv').jstree(true).search(v);
        }, 250);
    });
});