var windows = []
var currentTab;

backendDo(
    {mode:'idtab'},
    function (r) {
	//console.log('IDTAB got response: %s',r);
	currentTab = r;
	updateWindows();
    }
);


function updateWindows () {
    backendDo(
        {mode:'getwindows'},
	function (r) {
	    windows = []
	    if (r) {//console.log('Completed: %s',r);
		for (var w of r) {
		    windows.push(w);
		}
	    }
	    else {
		//console.log('weird, completed w/o result: %s',r);
	    }
	    //console.log('Windows=%s',windows);
	    var dups = []
	    windows.forEach( (w) => {
		//console.log('We have: %s',w);
		w.tabs.forEach(function (t) {
		    if (t.id==currentTab.id) {
			//console.log('This is us, nevermind');
			return
		    }
		    //console.log('We have tab: %s',t);
		    //console.log('%s: %s',t.title,t.url)
		    if (t.url==location.href) {
			//console.log('A DUP, A VERY PALPABLE DUP!');
			dups.push({window:w,tab:t,url:t.url});
			//console.log('%s=>%s',w.id,t.id);
			document.element
		    }
		});
	    })
	    if (dups.length > 0) {
		//console.log('We have %s dups',dups.length);
		createPopup(dups);
	    }
	}
    );
}


function backendDo (msg, callback) {
    chrome.runtime.sendMessage(
        msg,
	function (id) {
	    function checker (result) {
		//console.log('Checking for result of action: %s',id);
		if (result.done) {
		    callback(result.value);
		}
		else {
		    setTimeout(function () {
			chrome.runtime.sendMessage(
			    {mode:'check',action:id},
			    checker
			)
		    },200);
		}
	    }
	    // Start listening...
	    checker({done:false});
	});
}



var html = document.getElementsByTagName('html')[0]
function closePopup () {
    document.getElementById('chrome-att-popup').innerHTML = ''
    html.removeChild(
	document.getElementById('chrome-att-popup')
    )
}

function closeDup (p) {
    backendDo({
	mode:'close',
	tab:p.tab
    },function (r) {
	if (r) {
	    closePopup();
	    updateWindows(); // in case there are two...
	}
    })
}

function openDup (p) {
    backendDo(
        {
	    mode:'jump',
	    tab:p.tab,
	    window:p.window
        },
	function (r) {
	    //console.log('Success: %s',r)
	    if (r) {
		closePopup();
	    }
	}
    )
}

var BG = '#ede7f6';
var FG = '#311b92';
var ACTION_BG = '#d50000';
var ACTION_FG = '#ffffff';
var SECONDARY_BG = '#673ab7';
var SECONDARY_FG = '#ffffff';

function createPopup (dups) {
    var handlers = {
    }
    var wrapper = document.createElement('div')
    wrapper.setAttribute('style',
			 `
width: 100%;  
position: fixed; 
z-index: 2147483647; 
left: 0px;
top: 0px;
pointer-events:none;
`
			);			 
    wrapper.setAttribute('id',"chrome-att-popup");
    var iframeWrap = document.createElement('div');
    iframeWrap.setAttribute('style',`
width: 400px;
margin: auto;
background-color: rgba(255,255,255,0.7);
pointer-events:auto;
`);
    
    var d = document.createElement('div');
//     d.setAttribute('style',`
// width: 575px; 
// margin: auto; 
// background-color: ${BG}; 
// color: ${FG}; 
// padding: 1.3em; 
// border-radius: 0px 0px 50px 50px`);
//     wrapper.appendChild(d)
    var content = document.createElement('div');
    var iframe = document.createElement('iframe');
    iframe.setAttribute('id','all-the-things-popup')
    iframe.setAttribute('width',450);
    //iframe.setAttribute('height',250)
    iframe.setAttribute('style','margin:auto');
    iframeWrap.appendChild(iframe)
    wrapper.appendChild(iframeWrap);
    var template = ''
    iframe.setAttribute(
        'height',20 + 86*dups.length
    );
    for (let i=0; i<dups.length; i++) {
	template += `
<div class="container" id="chrome_att_dup_${i}" 
style="text-align: center">
  <b>Duplicate in ${(dups[i].window.id==currentTab.windowId) && 'this window' || 'a window with '+dups[i].window.tabs.length+' other tabs'}</b><br>
  <button class="closeb btn btn-outline-success">
       Close other Tab
       <br>(keep this one)
  </button>
  <button class="btn btn-outline-primary jump">
         Jump to other tab 
         <br>(close this one)
  </button> 
</div>`
	handlers['chrome_att_dup_'+i+' .jump'] = function () {openDup(dups[i])}
	handlers['chrome_att_dup_'+i+' .closeb'] = function () {closeDup(dups[i])}
    }
    content.innerHTML = template;
    var buttons = document.createElement('div');
    buttons.innerHTML = `
     <button id="chrome_att_close" type="button" class="close btn mr-3" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
     </button>
     `
     var debug=`<button style="float:right; color: ${SECONDARY_FG}; background-color: ${SECONDARY_BG}; width: 25px; height: 25px; padding: 5px; border-radius: 50%; border-style: none;" id="chrome_att_close">X</button>
    `;
    handlers.chrome_att_close = closePopup
    d.appendChild(buttons);
    d.appendChild(content);

    //console.log('Appending child!');
    // set up events...
    html.appendChild(wrapper);
    window.ifr = iframe.contentWindow.document;
    var iframe = document.getElementById('all-the-things-popup');
    var doc = iframe.contentWindow.document;
    //var bootstrap = chrome.extension.getURL("styles/bootstrap.css")
    //var link = `<link rel="stylesheet" href="${bootstrap}">`
    var link = `<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">`
    doc.getElementsByTagName('head')[0].innerHTML = link;
    doc.getElementsByTagName('body')[0].appendChild(d);
    window.idoc = doc;
    for (var id in handlers) {
	iframe.contentWindow.document.querySelector('#'+id).onclick = handlers[id];
    }
}
//console.log('Creating popup!');
//createPopup([{window:{tabs:[1,2,3,4,5],id:123},tab:23,url:'http://www.nytimes.com'}]);
