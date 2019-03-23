<template>
  <div class="main">
    <div class="backgroundwrap"></div>
  <div class="container-fluid">
    <div class="row d-flex header">
      <div class="col col-6">
	<strong class="brand">All the Things</strong>
      </div>
      <div class="col info col-3">
        <strong class="tabcount">{{tabCount}}</strong> tabs in
          <strong class="windowcount">{{windowCount}}</strong>
          {{windowCount==1&&'window'||'windows'}}
      </div>
      <div class="col search col-3">
        Search: <input v-model="search"></input>
      </div>
    </div>
    <br>
    <div class="row debug">
      SELECTED: <div v-for="tab in checkedTabs">
        {{tab}}
      </div>
    </div>
    <div class="windows row">
      <div v-bind:class="{
                         column:true, 
                         'col-xl-4':true,
                         'col-lg-6':true, 
                         'col-md-6':true, 
                         'col-sm-12':true, 
                         'p-3':true,
                         }" v-for="window in windows" :key="window.id" :id="window.id" >
        <div :class="{
                     border:true,
                     rounded:true,
                     focusedWindow:window.focused,
                     regularWindow:!window.focused,
                     'border-warning':window.focused,
                     'p-2':true}"
             bag="my-bag" v-dragula="window" :id="window.id"
             >
          <!--<div class="row">
            WINDOW HEADER
            <span class="align-self-right">Close</span>
          </div>-->
	  <div
	  v-bind:class="{
                        'd-inline-block':true,
                        'align-top':true,
                        column:true,
                        'p-2':true,
                        'col-xl-4':true,
                        'col-lg-4':true,
                        'col-md-6':true,
                        'col-sm-6':true,
                        }"
	  :key=tab.id
	  :id=tab.id
	  bag="my-bag"
	  v-on:dblclick="focusTab(window,tab)"
	  v-for="tab in window.tabs"
	    >
            <Tab :tab="tab"
                 :searched="!search || tab.title.toLowerCase().indexOf(search.toLowerCase())>-1"
                 @open="focusTab(window,tab)"
                 @close="closeTab(window,tab)"
                 :recursive="false"
                 >
            </Tab>
	  </div>
        </div> 
      </div>
    </div>
    <div class="row p-4">
      <button class="btn btn-primary align-self-right" v-on:click="newWindow">Add Window</button>
    </div>
    <div v-if="historyResults.length>0" class="ghosty">
      <div class="row">
        <h2>Ghosts of Tabs Past...
          <i  style="font-size:32px" class="fa fa-snapchat-ghost" aria-hidden="true"></i>
          <i  style="font-size:16px" class="fa fa-snapchat-ghost" aria-hidden="true"></i>
          <i  style="font-size:8px" class="fa fa-snapchat-ghost" aria-hidden="true"></i>
        </h2>
      </div>
      <div class="row">
        <div class="p-2 tab col-sm-6 col-md-4 col-lg-3 col-xl-2 align-top d-inline-block"
             v-for="result in historyResults" v-if="result.title">
          <Tab :tab="result" 
               @open="open(result.url)"
               searched="true"
               mode="ghost"
               :recursive="false"
             ></Tab>
	  <!--<div class="titlebar">
              <span class="right"><button class="open" v-on:click="open(result.url)"><i class="fa fa-external-link"></i></button></span>
          </div>
          <h2>{{result.title}}</h2>  -->
        </div>
      </div>
    </div>
  </div>
</div>
</template>

    <script>
import Vue from 'vue';
import Tab from './tab.vue';
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
    components : {
        Tab
        },
    data : function () {
        return {'windows': [{id:0,tabs:[{id:0,checked:false}]}],
                'search':'',
                'thisTab':null,
                'tabCount':'',
                'windowCount':'',
                'historyResults':[{checked:false,lastVisitTime:'',title:'',url:'',id:''}]}},
    computed : {
/*        checkedTabs : function () {
            var s = [];
            this.windows.forEach((w)=>{
                w.tabs.forEach((t)=>{
                    if (t.checked) {s.push(t)};
                })
            });
            return s;
        },*/
    },

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
	      that.windows = []; // kill the dummy window...
	      chrome.windows.getAll(
                  {populate:true},
		  function (r) {
		      if (r) {console.log('Completed: %s',r);
			      for (var w of r) {                                  
				  if (w.focused) {
				      that.windows.unshift(w)
				      // Let's find the active tag...
				      w.tabs.forEach(function (t) {
                                          console.log('Push ID %s',t.id);

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
	      try {chrome.windows.create(
		  {focused:false}
	      );
	      }
	      catch (err) {
	      	    chrome.windows.create()
	      }
	      this.refreshWindows();
	  },
	  focusTab : function (w,t) {
	      var that=this;
	      console.log('Focus tab %s',JSON.stringify([w,t]));
	      console.log('focus window: %s', w.id);
	      chrome.windows.update(w.id, {focused:true}, function (){console.log('done');})
	      console.log('highlight tabs: %s', JSON.stringify({windowId:w.id,tabs:t.id}));
	      //chrome.tabs.highlight({windowId:w.id,tabs:t.id});
	      try {
	      	      chrome.tabs.update(t.id,{highlighted:true,selected:true})
		      }
	      catch (err) {
		      console.log('ff? no highlighted')
	      	      chrome.tabs.update(t.id,{selected:true})
}
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

