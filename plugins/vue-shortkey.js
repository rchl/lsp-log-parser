import Vue from 'vue'
import vueShortkey from 'vue-shortkey'

Vue.use(vueShortkey)

const isMac = navigator.userAgent.includes('Mac OS X')
Vue.prototype.cmdOrCtrl = isMac ? 'meta' : 'ctrl'
