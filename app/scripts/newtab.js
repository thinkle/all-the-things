import Vue from 'vue';
import Newtab from '../component/newtab.vue';
import VueDragula from 'vue-dragula';
Vue.use(VueDragula);

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



var vm = new Vue({
    el : '#windowbox',
    render: h =>h(Newtab),
});


function getVM () {
    return vm
}
window.getVM = getVM;
