var createCORSRequest = function(
      method, url)
   {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in
         xhr)
      {
         // Most browsers.
         xhr.open(method, url,
            true);
      }
      else if (typeof XDomainRequest !=
         "undefined")
      {
         // IE8 & IE9
         xhr = new XDomainRequest();
         xhr.open(method, url);
      }
      else
      {
         // CORS not supported.
         xhr = null;
      }
	  xhr.setRequestHeader("Content-Type", "application/json");
      return xhr;
   };


function format(datetime){
	var datetime=new Date(datetime);
	var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]; 
	//var dayNames= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	var hh = datetime.getHours();
    	var dd = "am";
    	var h = hh;
    	if (h >= 12) {
        	h = hh-12;
        	dd = "pm";
    	}
    	if (h == 0) {
        	h = 12;
    	}
	var hour=h+ ":" + datetime.getMinutes()+" "+dd;
	var formatted =datetime.getDate()+" "+monthNames[datetime.getMonth()]+" "+ hour  ;
	return formatted;
}


var lastmessageID="0";
var defaultListLength="0";
var id=0;


jQuery(document).ready(function () {
	jQuery("#chatButton").click(function () {
		var text=$( ".form-control" ).val();

		var datetime=new Date($.now());
		var formatted =format(datetime);


		//$( ".newInsert" ).append( '<div class="direct-chat-msg right"><div class="direct-chat-info clearfix"><span class="direct-chat-name pull-right">Joe Smith</span><span class="direct-chat-timestamp pull-left">'+formatted+'</span></div><img alt="message user image" src="images/user8-128x128.jpg" class="direct-chat-img"><div class="direct-chat-text">'+text+'</div></div>' );
		
		insert(text, formatted);
	});

});

function insert(text, formatted){

	var insertToChatHistoryRequest = '{"request": {"method": "insertToChatHistory", "poid":"7894",  "userId":"15", "userName":"Joe Smith", "revisionId":"1123","message":"'+text+'"}}';
   	var url = 'https://demo.bimaas.uk:8247/internal/bim3d-insertToChatHistory';
	var method = 'POST';

   	var xhr = createCORSRequest(method, url,true);
	xhr.send(insertToChatHistoryRequest);
	$( ".new" ).append( '<div class="direct-chat-msg right"><div class="direct-chat-info clearfix"><span class="direct-chat-name pull-right">Joe Smith</span><span class="direct-chat-timestamp pull-left">'+formatted+'</span></div><img alt="message user image" src="images/user8-128x128.jpg" class="direct-chat-img"><div class="direct-chat-text">'+text+'</div></div>' );
}
  

setInterval (loadHistory, 60000);  

function loadHistory(){

	//alert(lastmessageID);
	
	$('.p').html("<img src='https:\/\/demo.bimaas.uk:9453\/bs_test\/images\/loading.gif'></img>");
	
   	var getChatHistory_OpRequest = '{"request": {"method": "getChatHistory","poid":"7894" , "startMessageId":"'+lastmessageID+'" }}';
   	var url = 'https://demo.bimaas.uk:8247/internal/bim3d-getChatHistory';
	
   	var method = 'POST';
	var xhr = createCORSRequest(method, url,true);
	xhr.send(getChatHistory_OpRequest);

	

	/* load chat history */
	xhr.onload = function()
   		{
			$('.p').html('');
      			var jsn = JSON.parse(xhr.response);
			//alert(xhr.response);
			$( ".new" ).html(' ');
			//$( ".old" ).html(' ');
			var lenght=jsn.Comments.Comment.length;
			$.each(jsn.Comments.Comment,function(i, v)
         		{
				
            			var datetime=new Date(v.timestamp);
				var formatted =format(datetime);
				if(lastmessageID == "0"){
					//alert(lenght);
					if(lenght < 3){
						$( ".new" ).append( '<div class="direct-chat-msg right"><div class="direct-chat-info clearfix"><span class="direct-chat-name pull-right">Joe Smith</span><span class="direct-chat-timestamp pull-left">'+formatted+'</span></div><img alt="message user image" src="images/user8-128x128.jpg" class="direct-chat-img"><div class="direct-chat-text">'+v.message+'</div></div>' );
				
					}else{
						$( ".old" ).append( '<div class="direct-chat-msg right"><div class="direct-chat-info clearfix"><span class="direct-chat-name pull-right">Joe Smith</span><span class="direct-chat-timestamp pull-left">'+formatted+'</span></div><img alt="message user image" src="images/user8-128x128.jpg" class="direct-chat-img"><div class="direct-chat-text">'+v.message+'</div></div>' );
			
					}
					lenght--;


				}
				if(lastmessageID > 0){
					//alert("new");
					//if(jsn.Comments.Comment.hasOwnProperty('message')){
						//alert("yes");
					//}
					
					$( ".new" ).append( '<div class="direct-chat-msg right"><div class="direct-chat-info clearfix"><span class="direct-chat-name pull-right">Joe Smith</span><span class="direct-chat-timestamp pull-left">'+formatted+'</span></div><img alt="message user image" src="images/user8-128x128.jpg" class="direct-chat-img"><div class="direct-chat-text">'+v.message+'</div></div>' );
				}
				id=v.messageId;
			});
			if(lastmessageID == "0"){
				//defaultListLength=(id-3);
				//alert(defaultListLength);
				lastmessageID=(id - 2);
			}
			
			

		}

    
}




