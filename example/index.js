var Vue = require('vue');
Vue.component('pullrefresh-cpt', require('../src'));
require('./style.css');

new Vue({
    el: 'body',
    data: {
        idx: 0
    },
    events: {
        'pull-to-refresh': function (t) {
            setTimeout(() => {
                this.$broadcast('pull-to-refresh-close');
                this.idx = 20;
            }, 3000);
        }
    },
    ready() {
        this.$broadcast('pull-to-refresh-waiting');
        setTimeout(() => {
            this.$broadcast('pull-to-refresh-close');
            this.idx = 20;
        }, 3000);
    }
});
