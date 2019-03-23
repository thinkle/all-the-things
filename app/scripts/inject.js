//console.log('Hello world');
var windows = []
var currentTab;

backendDo({mode:'idtab'},
	  function (r) {
	      //console.log('IDTAB got response: %s',r);
	      currentTab = r;
	      updateWindows();
	  });


function updateWindows () {
backendDo({mode:'getwindows'},
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
			windows.forEach(function (w) {
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
				// for (var prop in t) {
				//     console.log('Tab has prop %s=>%s',
				// 		prop,
				// 		t[prop]);
				// }
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
    chrome.runtime.sendMessage(msg,
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
    //console.log('close!');
    //console.log('empty wrapper');
    document.getElementById('chrome-att-popup').innerHTML = ''
    //console.log('remove!');
    html.removeChild(
	document.getElementById('chrome-att-popup')
    )

}

function closeDup (p) {
    //console.log('Close dup: %s',p);
    backendDo({
	mode:'close',
	tab:p.tab
    },function (r) {
		  //console.log('Success: %s',r)
		  if (r) {
		      closePopup();
		      updateWindows(); // in case there are two...
		  }
	      })
}

function openDup (p) {
    //console.log('Open dup: %s',p);
    backendDo({
	mode:'jump',
	tab:p.tab,
	window:p.window
    },
	      function (r) {
		  //console.log('Success: %s',r)
		  if (r) {
		      closePopup();
		  }
	      })
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
`
			);			 
    wrapper.setAttribute('id',"chrome-att-popup");
    var d = document.createElement('div');

    d.setAttribute('style',`
width: 575px; 
margin: auto; 
background-color: ${BG}; 
color: ${FG}; 
padding: 1.3em; 
border-radius: 0px 0px 50px 50px`);
    wrapper.appendChild(d)
    var content = document.createElement('div');
    var template = ''
    for (let i=0; i<dups.length; i++) {
	template += `<div id="chrome_att_dup_${i}" style="text-align: center"><b>Duplicate in ${(dups[i].window.id==currentTab.windowId) && 'this window' || 'a window with '+dups[i].window.tabs.length+' other tabs'}</b><br>
                          <button style="font-size:x-small; background-color: ${SECONDARY_BG}; color: ${SECONDARY_FG}; width: 185px; border-radius: 15px; border-style: none; margin-right: 10px; display: inline-block; " class="close">
<table style="margin: auto"><tr><td style="color: ${SECONDARY_FG}">
close other Tab<br>(keep this one)
</td><td><span style="font-size: 25px; color: ${SECONDARY_FG}">x</span></td></tr></table>
</button>
                          <button style="font-size:x-small; background-color: ${ACTION_BG}; color: ${ACTION_FG}; width: 185px; padding-left: 1em; border-radius: 15px; border-style: none; display: inline-block;" class="jump">
<table style="margin:auto"><tr><td style="color: ${ACTION_FG}">Jump to other tab <br>(close this one)</td><td><span style="font-size: 25px; color:${ACTION_FG}">↬</span></td></tr></table></button> 
                </div>`
	handlers['chrome_att_dup_'+i+' .jump'] = function () {openDup(dups[i])}
	handlers['chrome_att_dup_'+i+' .close'] = function () {closeDup(dups[i])}
    }
    content.innerHTML = template;
    var buttons = document.createElement('div');
    buttons.innerHTML = `
     <button style="float:right; color: ${SECONDARY_FG}; background-color: ${SECONDARY_BG}; width: 25px; height: 25px; padding: 5px; border-radius: 50%; border-style: none;" id="chrome_att_close">X</button>
    `;
    handlers.chrome_att_close = closePopup
    d.appendChild(content);
    d.appendChild(buttons);
    //console.log('Appending child!');
    // set up events...
    html.appendChild(wrapper);
    for (var id in handlers) {
	document.querySelector('#'+id).onclick = handlers[id];
    }
}
//console.log('Creating popup!');
//createPopup([{window:{tabs:[1,2,3,4,5],id:123},tab:23,url:'http://www.nytimes.com'}]);
