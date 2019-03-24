<template>
<div class="main">
  <div class="background"
       :style="{ 
               backgroundColor : bgColor,
               backgroundImage: 'url(' + bg + ')' 
               }">
  </div>
  <div class="backgroundwrap"></div>
  <div class="container-fluid">
    <div class="row d-flex header bg-semitrans">
      <div class="col col-3">
	<strong class="brand">All the Things</strong>
        <button class="btn" @click="showPrefs=!showPrefs">
          <i class="fa fa-cog"></i>
        </button>
      </div>
      <div class="col info col-5">
        <strong class="tabcount">{{tabCount}}</strong> tabs in
        <strong class="windowcount">{{windowCount}}</strong>
        {{windowCount==1&&'window'||'windows'}}
      </div>
      <div class="col search col-4">
        Search: <input v-model="search"></input>
      </div>
    </div>
    <br>
    <div class="row" v-if="showPrefs">
      <div class="col-3"></div>
      <div class="col-6">
        <div v-if="showPrefs" class="card mx-auto">
          <div class="d-flex card-header">
            <span class="mr-auto">Prefs</span>
            <button @click="showPrefs=false" class="btn align-self-end"><i class="fa fa-close"></i></button>
          </div>
          <div class="card-body">
            <div class="container">
              <div class="row">
                <div class="col col-4">
                  <label>
                    <input type="radio" group="bgchoice" v-model="bgMode" value="color">
                    Solid Background
                  </label>
                </div>
                <div class="col col-4">
                  <label>
                    <input type="radio" group="bgchoice" v-model="bgMode" value="flickr">
                    Random Flickr Image
                  </label>
                </div>
                <div class="col col-4">
                  <label>
                    <input type="radio" group="bgchoice" v-model="bgMode" value="custom">
                    Custom Image URL
                  </label>
                </div>
              </div>
              <div class="row mb-2 d-flex">
                <label class="d-flex flex-fill flex-grow-1">Background Search (use Flicker):
                  <input class="flex-fill flex-grow-1" v-model="newbg">
                </label>
                <button class="ml-2 btn btn-sm btn-primary" @click="saveProp('bgsearch',newbg)"><i class="fa fa-save"></i></button>
              </div>
              <div class="row mb-2 d-flex">
                <label class="d-flex flex-grow-1 flex-fill">
                  Background URL:
                  <input v-model="newBgUrl" class="flex-fill flex-grow-1"></label>
                <button class="ml-2 btn btn-sm btn-primary" @click="saveProp('bgUrl',newBgUrl)"><i class="fa fa-save"></i></button>
              </div>
              <div class="row d-flex">
                <label class="d-flex flex-grow-1 flex-fill">
                  Background Color:
                  <input class="flex-grow-1 flex-fill" v-model="newBgColor">
                </label>
                <button class="btn btn-sm ml-2 btn-primary" @click="saveProp('bgColor',newBgColor)"><i class="fa fa-save"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-3"></div>
    </div>
    <div class="row debug">
      
      <div class="mx-auto" v-if="checkedTabs.length>0">
        <h3>{{checkedTabs.length}} Selected</h3>
        <button @click="unselect()" class="btn btn-secondary mr-auto">Unselect</button>
        <button @click="moveSelected()"  class="btn btn-primary">Move Selected to New Window</button>
        <button @click="closeSelected()" class="btn btn-danger">Close Selected</button>
        
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
                         }" v-for="window,n in windows" :key="window.id" :id="window.id" >
        <div :class="{
                     border:true,
                     rounded:true,
                     focusedWindow:window.focused,
                     regularWindow:!window.focused,
                     'border-warning':window.focused,
                     'p-2':true}"
             bag="my-bag" v-dragula="window" :id="window.id"
             >
          <div class="d-flex">
            <h3 class="mr-auto">
              <span contenteditable @input="setWindowTitle(window.id,$event)">{{windowInfo[window.id].name}}</span>
              <span :class="{
                            badge:true,
                            'text-light':true,
                            'badge-dark':window.tabs.length<=4,
                            'badge-warning':window.tabs.length>4&&window.tabs.length<10,
                            'badge-danger':window.tabs.length>=10
                            }">
                {{window.tabs.length}} Tabs
              </span>
            </h3>
            <button class="btn btn-sm text-dark" @click="selectAllInWindow(window)"><i class="fa fa-check-circle"></i></button>
              <button class="btn btn-sm text-danger"  @click="closeWindow(window)"><i class="fa fa-close"></i></button>
          </div>
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
    <!--<div class="row p-4">
        <button class="btn btn-primary align-self-right" v-on:click="newWindow">Add Window</button>
    </div>-->
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

function Prefs (keys) {

    var runWhenReady = [];
    var ready = false;

    var prefObj = {

        prefs : {},


        ready (f) {
            if (ready) {
                console.log('Prefs.ready() run right away');
                f()
            }
            else {
                console.log('Prefs.ready - lets hold on a sec');
                runWhenReady.push(f);
            }
        },

        updatePrefs () {
            var self = this;
            console.log('Fire off updatePrefs...');
            chrome.storage.sync.get(keys, (r)=>{
                console.log('updatePrefs got prefs! %s',r);
                keys.forEach(
                    (k)=>{
                        console.log('Got pref: %s',k);
                        try { 
                            self.prefs[k] = JSON.parse(r[k]);
                            console.log('Parsed %s => %s',r[k],self.prefs[k]);
                        }
                        catch (err) {
                            console.log('Error parsing pref key: %s, value: %s',k,r[k]);
                            console.log('Use raw value');
                            self.prefs[k] = r[k];
                        }
                    }
                );
                ready = true;
                while (runWhenReady.length>0) {
                    console.log('Running queued function: prefs are ready!');
                    runWhenReady.pop()();
                }
                    
                
            });
            console.log('waiting for prefs...');
        },

        get (k) {
                return this.prefs[k]
        },

        set (k, v) {
            var self = this;
            if (keys.indexOf(k)==-1) {
                throw ['Key %s not registered for prefs %s',k,keys];
            }
            var setDic = {};
            setDic[k] = JSON.stringify(v);
            self.prefs[k] = v;
            console.log('Initially setting prefs %s: %s',k,self.prefs[k])
            chrome.storage.sync.set(setDic,
                                     ()=>{
                                         console.log('Set %s in memory => %s',k,setDic[k]);
                                     });
        }

        
    };

    prefObj.updatePrefs();
    return prefObj;
}


var p = Prefs(
    ['bgsearch','bgUrl','bgColor','bgMode']
);
window.p = p;
export default {
    components : {
        Tab
    },
    mounted : function () {
        console.log('MOUNTED!');
        p.ready(()=>{
            if (p.get('bgsearch')) {
                this.newbg = p.get('bgsearch');
                this.bgsearch = p.get('bgsearch');
                console.log('Got new image!');
                this.$forceUpdate();
            }
            if (p.get('bgUrl')) {
                this.newBgUrl = p.get('bgUrl');
                this.bgUrl = p.get('bgUrl');
                this.$forceUpdate();
            }
            if (p.get('bgColor')) {
                this.bgColor = p.get('bgColor');
                this.newBgColor = p.get('bgColor');
                this.$forceUpdate();
            }
            if (p.get('bgMode')) {
                this.bgMode = p.get('bgMode');
                this.$forceUpdate();
            }
        }
               );
    },
    data : function () {
        return {
            windowInfo : {
                0 : {
                    name : '',
                    color : '',
                }
            },
            windows: [{id:0,tabs:[{id:0,checked:false}]}],
            search:'',
            showPrefs:false,
            
            bgMode : 'flickr',

            bgsearch:'mountain',
            newbg:'mountain',
            bgUrl : '',
            newBgUrl : '',
            bgColor : '',
            newBgColor : '',

            thisTab:null,
            tabCount:'',
            windowCount:'',
            historyResults:[{checked:false,lastVisitTime:'',title:'',url:'',id:''}]}
    },
    computed : {
        bg : function () {
            if (this.bgMode=='flickr') {
                return `https://loremflickr.com/1920/1080/${this.bgsearch.replace(' ','+')}`
            }
            else if (this.bgMode=='color') {
                return ''
            }
            else {
                return this.bgUrl
            }
        },
        checkedTabs : function () {
            var s = [];
            this.windows.forEach((w)=>{
                w.tabs.forEach((t)=>{
                    if (t.checked) {s.push(t)};
                })
            });
            return s;
        },
    },
    
    methods : {
        saveProp : function (prop,val) {
            console.log('SAVE %s=>%s',prop,val);
            p.set(prop,val);
            this[prop] =val;
            },
        saveBg : function () {
            p.set('background-search',this.newbg);
            this.bgsearch = this.newbg;
        },
        toggleProp : function (obj, prop) {
            this.$set(obj,prop,!obj[prop]);
        },
	open : function (url) {
	    window.open(url)
	    setTimeout( ()=> {
		chrome.tabs.remove(this.thisTab.id)
		// Close window after a second...
	    },100)
            
	},
	refreshWindows : function () {
	    this.windows = []; // kill the dummy window...
	    chrome.windows.getAll(
                {populate:true},
		(r) => {
		    if (r) {console.log('Completed: %s',r);
                            var n = 1;
			    for (var w of r) {
                                n += 1;
                                if (!this.windowInfo[w.id]) {
                                    console.log('initializing windowInfo for %s',w.id);
                                    this.windowInfo[w.id] = {
                                        name : 'Window '+n,
                                        color : 'normal'
                                    }
                                }
				if (w.focused) {
				    this.windows.unshift(w)
				    // Let's find the active tag...
				    w.tabs.forEach((t)=>{
                                        console.log('Push ID %s',t.id);
                                        
					if (t.active) {
					    this.thisTab = t;
					}
				    })
				}
				else {
   				    this.windows.push(w);
				}
			    }
			    this.updateCounts()
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
	    that.windowCount = this.windows.length
	    that.tabCount = this.windows.reduce(
		(acc, w) => {
		    acc += w.tabs.length
		    return acc
		},0);
	    console.log('Set windowCount to %s',this.windowCount);
	    console.log('Set tabCount to %s',this.tabCount);
	},
        // Methods for handling selected tabs...
        unselect : function () {
            this.checkedTabs.forEach((t)=>t.checked = false);
        },
        closeSelected : function () {
            this.checkedTabs.forEach(
                (t)=>{
                    chrome.tabs.remove(t.id);
                }
            );
            setTimeout(()=>this.refreshWindows(),50);
        },
        moveSelected : function () {
            chrome.windows.create(
                {focused:false},
                (w)=>{
                    console.log('Made window - move tabs!');
                    this.checkedTabs.forEach(
                        (t)=>{
                            chrome.tabs.move(Number(t.id),
                                             {windowId:Number(w.id),
                                             index:0});
                        }
                    ); // end each tab
                    //console.log('now focus tab!');
                    //chrome.windows.update(w.id,{focused:true});
                    w.tabs.forEach((t)=>{
                        if (t.active) {
                            console.log('remove empty tab we created to start');
                            chrome.tabs.remove(t.id);
                        }
                    });
                });
            setTimeout(()=>chrome.tabs.remove(this.thisTab.id),200);
        },
        // window operations.
        selectAllInWindow (window) {
            this.$set(window,'selectAll',true);
            window.tabs.forEach(
                (t) => {
                    console.log('check tab %s',t);
                    this.$set(t,'checked',!t.checked);;
                }
            );
            this.$forceUpdate();
        },
        closeWindow (window) {
            chrome.windows.remove(window.id);
            this.refreshWindows();
        },
        setWindowTitle (windowId, event) {
            console.log('Set title!',windowId,event);
            this.$set(this.windowInfo[windowId],'name',event.target.innerText);
            chrome.runtime.sendMessage(
                {mode:'setWindowInfo',windowInfo:this.windowInfo}
            );
        }
    },
    watch : {
        windowInfo : function (val) {
            console.log('windowInfo changed! %s',val)
            chrome.runtime.sendMessage(
                {mode:'setWindowInfo',windowInfo:this.windowInfo}
            );
        },
        bgMode : function (val, oldval) {
            if (val!=oldval) {
                p.set('bgMode',this.bgMode);
            }
        },
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
        chrome.runtime.sendMessage(
            {mode:'getWindowInfo'},
            (windowInfo)=>{
                console.log('Got window info! %s',windowInfo);
                console.log('Currently we have: %s',JSON.stringify(this.windowInfo));
                if (windowInfo) {
                    for (var key in windowInfo) {
                        this.$set(this.windowInfo,key,windowInfo[key]); // update
                    }
                }
                console.log('Now we have%s',JSON.stringify(this.windowInfo));
                this.$forceUpdate();
            }
        );
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

