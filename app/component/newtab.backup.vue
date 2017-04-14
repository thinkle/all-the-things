<template>
  <div class="windowbox">
    <div class="container window" v-for="window in windows" :key="window.id" :id="window.id" bag="my-bag" v-dragula="window">
      <h1>WINDOW</h1>
    <div class="tab"
:key=tab.id
:id=tab.id
bag="my-bag"
v-on:dblclick="focusTab(window,tab)"
v-for="tab in window.tabs"
    >

    <h2><img :src="tab.favIconUrl">{{tab.title}}</h2>
    <button v-on:click="closeTab(window,tab)">X</button>
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
      data : function () {return {'windows': [{id:0,tabs:[]}]}},
      methods : {
	  focusTab : function (w,t) {
	      console.log('Focus tab %s',JSON.stringify([w,t]));
	      console.log('focus window: %s', w.id);
	      chrome.windows.update(w.id, {focused:true}, function (){console.log('done');})
	      console.log('highlight tabs: %s', JSON.stringify({windowId:w.id,tabs:t.id}));
	      //chrome.tabs.highlight({windowId:w.id,tabs:t.id});
	      chrome.tabs.update(t.id,{highlighted:true,selected:true})
	  },
	  closeTab : function (w,t) {
	      console.log('Remove tab %s from %s',t,w);
	      chrome.tabs.remove(t.id);
	      var window = this.windows[this.windows.indexOf(w)]
	      window.tabs.splice(window.tabs.indexOf(t),1);
	  }
      },
      created : function () {
	  //Vue.vueDragula.options('my-bag', {
	  //direction: 'vertical'
      //});
	  var that = this;
	  this.windows.pop(); // kill the dummy window...
	  backendDo({mode:'getwindows'},
		    function (r) {
			if (r) {console.log('Completed: %s',r);
				for (var w of r) {
				    that.windows.push(w);
				}
			       }
			else {
			    console.log('weird, completed w/o result: %s',r);
			}
		    }
		   );
	  console.log('Done with create hook');
      //},
	  //ready: function () {
	  console.log('Ready I am!');
	  var _this = this
	  Vue.vueDragula.eventBus.$on(
	      'drop',
	      function (args) {
		  console.log('drop: ' + args)
		  var el = args[0]; var target=args[1]; var sib=args[2]; var source=args[3]
		  console.log('Dropped got %s, %s, %s, %s',
			      el, target, sib, source);
		  console.log('Target tab is: %s',target.id);
		  console.log('Target sib is: %s',sib.id);
		  console.log('Target window is: %s',target.id);
		  console.log('Source window is: %s',source.id);
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
