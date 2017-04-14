<template>
  <div class="windowbox">
    <div class="header">
      <span class="lefty">
	<strong class="brand">All the Things</strong>  
	<span class="info">You have <strong>{{tabCount}}</strong> tabs open in  <strong>{{windowCount}}</strong> windows</span>
      </span>
      <span class="search">Search: <input v-model="search"></input></span></div>
    <br>
    <div class="windows">
      <div v-bind:class="{container:true, window:true, focused:window.focused}" v-for="window in windows" :key="window.id" :id="window.id" bag="my-bag" v-dragula="window">
	<div
	  v-bind:class="{tab:true,focused:tab.active,searched:!search || tab.title.toLowerCase().indexOf(search.toLowerCase())>-1}" 
	  :key=tab.id
	  :id=tab.id
	  bag="my-bag"
	  v-on:dblclick="focusTab(window,tab)"
	  v-for="tab in window.tabs"
	  >
	  <div class="titlebar">
	    <button class="close" v-on:click="closeTab(window,tab)"><i class="fa fa-times-circle" aria-hidden="true"></i></button>
            <span class="right"><button class="open" v-on:click="focusTab(window,tab)"><i class="fa fa-external-link"></i></button></span>
	  </div>
	  <h2><img width="18" :src="tab.favIconUrl">{{tab.title}}</h2>
	</div>
      </div>
	<button class="newwindow" v-on:click="newWindow">+</button>
    </div>
    <div class="history" v-if="historyResults.length>0"> <!--   v-dragula="historyResults" bag="my-bag"> -->
    <h2></i>Ghosts of Tabs Past...<i style="font-size:100%" class="fa fa-snapchat-ghost" aria-hidden="true"></i>
<i  style="font-size:80%" class="fa fa-snapchat-ghost" aria-hidden="true"></i>
<i  style="font-size:40%" class="fa fa-snapchat-ghost" aria-hidden="true"></i><i  style="font-size:20%" class="fa fa-snapchat-ghost" aria-hidden="true"></i>
</h2>
      <div class="historyResult searched tab" v-for="result in historyResults" v-if="result.title">
	  <div class="titlebar">
            <span class="right"><button class="open" v-on:click="open(result.url)"><i class="fa fa-external-link"></i></button></span>
          </div>
          <h2>{{result.title}}</h2> 
      </div>
    </div>
  </div>
</template>

    <script>
    import Vue from 'vue';
function backendDo (msg, callback) {
    chrome.runtime.sendMessage(msg,
			       function (id) {
				   function checker (result) {
				       console.log('Checking for result of action: %s',id);
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

  
  export default {
      data : function () {return {'windows': [{id:0,tabs:[]}],'search':'','thisTab':null, 'tabCount':'','windowCount':'',
				  'historyResults':[{lastVisitTime:'',title:'',url:'',id:''}]}},
      methods : {
	  open : function (url) {
	      var that = this;
	      window.open(url)
	      setTimeout(function () {
		  chrome.tabs.remove(that.thisTab.id)
		  // Close window after a second...
	      },100)

	  },
	  refreshWindows : function () {
	      var that = this;
	      this.windows = []; // kill the dummy window...
	      chrome.windows.getAll({populate:true},
				    function (r) {
					if (r) {console.log('Completed: %s',r);
						for (var w of r) {
						    if (w.focused) {
							that.windows.unshift(w)
							// Let's find the active tag...
							w.tabs.forEach(function (t) {
							    if (t.active) {
								that.thisTab = t;
							    }
							})
						    }
						    else {
   							that.windows.push(w);
						    }
						}
						that.updateCounts()
					       }
			else {
			    console.log('weird, completed w/o result: %s',r);
			}
		    })
	      console.log('Done with create hook');
	  },
	  newWindow : function () {
	      chrome.windows.create(
		  {focused:false}
	      );
	      this.refreshWindows();
	  },
	  focusTab : function (w,t) {
	      var that=this;
	      console.log('Focus tab %s',JSON.stringify([w,t]));
	      console.log('focus window: %s', w.id);
	      chrome.windows.update(w.id, {focused:true}, function (){console.log('done');})
	      console.log('highlight tabs: %s', JSON.stringify({windowId:w.id,tabs:t.id}));
	      //chrome.tabs.highlight({windowId:w.id,tabs:t.id});
	      chrome.tabs.update(t.id,{highlighted:true,selected:true})
	      setTimeout(function () {
		  chrome.tabs.remove(that.thisTab.id)
		  // Close window after a second...
	      },100)
	  },
	  closeTab : function (w,t) {
	      console.log('Remove tab %s from %s',t,w);
	      chrome.tabs.remove(t.id);
	      var window = this.windows[this.windows.indexOf(w)]
	      window.tabs.splice(window.tabs.indexOf(t),1);
	      if (window.tabs.length==0) {
		  this.windows.splice(this.windows.indexOf(window),1);
	      }
	      this.updateCounts();
	  },
	  updateCounts : function () {
	      var that = this;
	      that.windowCount = that.windows.length
	      that.tabCount = that.windows.reduce(
		  function (acc, w) {
		      acc += w.tabs.length
		      return acc
		  },0);
	      console.log('Set windowCount to %s',that.windowCount);
	      console.log('Set tabCount to %s',that.tabCount);
	  }
      },
      watch : {
	  search : function (val, oldval) {
	      var that = this;
	      if (val) {
		  that.curSearch = val;
		  function doSearch (v, days) {
		      console.log('Search %s->%s (%s)',oldval,val,days);
		      const day = 1000 * 60 * 60 * 24
		      chrome.history.search({'text':val,
					     startTime: (new Date).getTime()-day*days,
					    },function (r) {
						if (v==that.curSearch) {
						    that.historyResults = r;
						    console.log('Got history results: %s (%s)',that.historyResults.length,days);
						    if (that.historyResults.length < 10 && days < 30) {
							console.log('recurse back further...')
							doSearch(v,days*2)
						    }
						}
						else {
						    console.log('ignore obsolete search results');
						}
					    }); // end search
		  }
		  doSearch(val,1);
	      }
	      else {
		  that.historyResults = [];
	      }
	  }
      },
      created : function () {
	  this.historyResults = []
	  Vue.vueDragula.options('my-bag', {
	  direction: 'horizontal'
	  });
	  this.refreshWindows()
	  //ready: function () {
	  console.log('Ready I am!');
	  var _this = this
	  Vue.vueDragula.eventBus.$on(
	      'drop',
	      function (args) {
		  console.log('drop: ' + args)
		  var bag = args[0]; var el = args[1]; var target=args[2]; var source=args[3]; var sib=args[4]
		  console.log('Dropped got %s, %s, %s, %s',
			      el, target, sib, source);
		  console.log('Target tab is: %s',el.id);
		  if (sib) {
		      console.log('Target sib is: %s %s',sib.id,sib.index);
		  }
		  console.log('Target window is: %s',target.id);
		  console.log('Source window is: %s',source.id);
		  chrome.windows.get(Number(target.id),{populate:true},
				     function (window) {
					 //chrome.tabs.get(sib.id, function (sibobj) {
					 //console.log('Got sibobj: %s %s',sibobj,sibobj.index);
					 //chrome.tabs.move(Number(el.id),{windowId:Number(target.id),index:sibobj.index});
				     //});
					 console.log('Got window %s==%s!',window.id,target.id);
					 if (sib) {
					 window.tabs.forEach(function (t,idx) {
					     if (t.id==sib.id) {
					 	 console.log('Found sibling! %s %s',t.id,idx);
						 if (idx>0) {idx = idx-1}
					 	 // Now we move :)
					 	 console.log('chrome.tabs.move(%s,{windowId:%s,index:%s})',
					 		     el.id,target.id,idx);
					 	 chrome.tabs.move(Number(el.id),{windowId:Number(target.id),index:idx});
                                                 console.log('Did move:');
    
					     }
					     else {
					 	 console.log('Sibling is not %s',t.id);
					     }
					 }); // end for Each tabs
					 }
					 else {
					     chrome.tabs.move(Number(el.id),{windowId:Number(target.id),index:-1});
					     console.log('Default to last?')
					 }
					 _this.refreshWindows();
				     });		    
	      }
	  )
	  Vue.vueDragula.eventBus.$on(
	      'dropModel',
	      function (args) {
		  console.log('dropModel: ' + args)
		  //console.log(_this.categories)
	      }
	  )
	  console.log('registered drop and dropModel listeners');
      },
  }
</script>
