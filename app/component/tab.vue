<template>
  <div style="position:relative;"
       > <!-- wrapper -->

  <div :class="{
               card:true,
               tabbox:!recursive,
               searched:searched,
               tab:false,
               focused:tab.active,
               'border-danger':tab.checked,
               'border-success':tab.selected,
               }"
       :style="recursive&&'overflow:default'"
       > <!-- inner container with tab border -->
    <div :class="{
                'card-topline':true,
                'bg-light':!tab.checked&&!tab.selected,
                'bg-primary':tab.selected,
                'bg-dark':tab.checked,
                'text-dark':!tab.checked,
                'text-light':tab.checked,
                'p-1':true,
                'd-flex':true,
                'mini':true,
                }">
      <input type="checkbox" :checked="tab.checked" @click="toggleProp(tab,'checked')">
      <span class="mr-auto" @click="toggle()" v-if="mode=='ghost'">
        <i class="fa fa-snapchat-ghost"></i>
      </span>
      <span v-else class="mr-auto" @click="toggle()"><img width="15" height="15" :src="tab.favIconUrl"></span>
      <span>
	<button v-if="mode!='ghost'" class="btn btn-sm p-1  bg-danger text-white" @click="close()"><i class="fa fa-times-circle" aria-hidden="true"></i></button>
        <button class="btn btn-sm p-1  bg-info text-white" v-on:click="open()"><i class="fa fa-external-link"></i></button>
      </span>
    </div>
    <div class="card-body p-1 sm" @click="doExpand()"
         :style="recursive&&'font-size:17px;overflow:default;background-color:white'">
      {{tab.title}} 
    </div>
  </div>
    <div v-if="expand" style="z-index:50;position:fixed;top:0;left:0;width:100%;height:3000px" @click="doContract()"></div>
    <div
      v-if="expand && !recursive"
      style="position:absolute;top:0px;left:0px;z-index:99;width:100%;min-height:100%;overflow:default;background-color:white;"
      class="card p-1 md border"
      >
      <Tab recursive="true"
           :searched="searched"
           :tab="tab"
           :mode="mode"
           @open="open()"
           @close="close()"
           ></tab>
      <!--<div class="card-topline bg-light p-1 d-flex mini">
        <span class="mr-auto" @click="toggle()"><img width="15" height="15" :src="tab.favIconUrl"></span>
        <span>
	  <button class="btn btn-sm p-1  bg-danger text-white" @click="close()"><i class="fa fa-times-circle" aria-hidden="true"></i></button>
          <button class="btn btn-sm p-1  bg-info text-white" v-on:click="open()"><i class="fa fa-external-link"></i></button>
        </span>
      </div>
      <div class="card-body p-2 sm" style="font-size:17px;overflow:scroll;background-color:white;"
           @click="doContract()"
           >
        {{tab.title}} 
      </div>-->
    </div>
  </div>
</template>          
<script>
export default {
    props : ['tab','searched','mode','recursive',
            ],
    name : 'Tab',
    methods : {
        toggleProp : function (o,p) {
            // Work around trouble updating new properties.
            this.$set(o,p,!o[p]);
        },
        open : function () {
            console.log('OPEN');
            this.$emit('open');
        },
        close : function () {
            console.log('CLOSE');
            this.$emit('close');
        },
        doExpand : function () {
            console.log('EXPAND');
            this.expand = true;
        },
        doCheck : function (e) {
            this.checked = e.target.checked
            console.log('doCheck => %s',this.checked);
            this.$emit('input',e.target.checked);
        },
        doContract : function () {
            console.log('CONTRACT');
            this.expand = false;
        },
        toggle : function () {
            console.log('TOGGLE');
            this.expand = !this.expand;
        },
    },
    data : function () {
        return {
            expand : false,
            checked : this.value,
        }
    }
}
</script>
