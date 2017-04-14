
function getWindows (callback) {
    console.log('Get windows!');
    chrome.windows.getAll(
	{populate:true},
	callback
    )
}


var completedActions = {}
var lastId = 0;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

	if (request.mode=='check') {
	    if (completedActions[request.action]) {
		sendResponse({done:true,
			      value:completedActions[request.action]
			     })
	    }
	    else {
		sendResponse({done:false});
	    }
	}
	
	else {

	    //sendResponse('Foo! Bar! Baz!');
	    lastId += 1;
	    var actionId = lastId;

	    sendResponse(actionId);
	    if (request.mode=='getwindows') {
		function gotWindows (w) {
		    console.log("Got windows: %s",JSON.stringify(w));
		    console.log('Sending windows!');
		    completedActions[actionId] = w
		}
	
		if (request.mode == 'getwindows') {
		    console.log('getWindows');
		    getWindows(gotWindows)
		}
	    }
	}
    });
