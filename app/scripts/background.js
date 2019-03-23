
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
	    if (request.mode=='jump') {
		console.log('Jump to dup!');
		console.log('What to do with request: %s',JSON.stringify(request));
		chrome.windows.update(request.window.id,{focused:true},function (){});
		try {
		    chrome.tabs.update(request.tab.id,{highlighted:true,selected:true});
		}
		catch (err) {
		    console.log('Firefox? Error w/ highlighted');
		    chrome.tabs.update(request.tab.id,{selected:true});
		}
		chrome.tabs.remove(sender.tab.id);
		completedActions[actionId] = true
	    }
	    if (request.mode=='close') {
		console.log('Close!');
		console.log('What to do with request: %s',JSON.stringify(request));
		chrome.tabs.remove(request.tab.id);
		completedActions[actionId] = true
	    }
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
	    if (request.mode=='idtab') {
		completedActions[actionId] = sender.tab;
	    }
	}
    });
