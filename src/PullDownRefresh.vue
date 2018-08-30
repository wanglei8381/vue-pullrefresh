<template>
<div class="pulldown-refresh-wrapper">
    <div class="pulldown-background">
        <div class="pulldown-action">
            <img :class="['icon-loading', iconClass]" :src="iconPath">
            <span>{{ text }}</span>
        </div>
    </div>
    <slot></slot>
</div>
</template>

<script>
import Touch from 'super-touch'
import arrowIcon from '../../../img/down-arrow.png'
import loadingIcon from '../../../img/juhua-loading.png'
export default {
  name: 'PullDownRefresh',
  props: {
    refresh: {
      type: Function,
      required: true
    },
    distinct: {
      type: Number,
      default: 50
    },
    paused: {
      type: Boolean,
      default: false
    },
    scrollEl: {
      type: [Object, String],
      default: '#scroll'
    }
  },
  data () {
    return {
      text: '下拉刷新',
      iconPath: arrowIcon,
      iconClass: '',
      ended: false
    }
  },
  mounted () {
    const touch = new Touch(this.$el)
    this.touch = touch
    touch.start()
    const $scroll =
            typeof this.scrollEl === 'string'
              ? document.querySelector(this.scrollEl)
              : this.scrollEl
    let isTop = () => $scroll.scrollTop === 0
    let toTop = isTop()
    touch.on('touch:start', () => {
      this.ended = false
    })
    touch.on('touch:move', res => {
      if (!this.paused && toTop) {
        let deltaY = res.y2 - res.y1
        if (deltaY < 0) return
        res.e.preventDefault()
        this.handleMove(deltaY / 3 + 10)
      }
    })
    touch.on('touch:end', res => {
      if (!this.paused && toTop) {
        let distinct = res.y2 - res.y1
        this.handleEnd(distinct / 3 + 10)
      }
    })
    touch.on('touch:cancle', res => {
      this.resume()
    })
    $scroll.addEventListener('scroll', () => {
      toTop = isTop()
    })
  },
  beforeDestroy () {
    this.touch.destroy()
  },
  methods: {
    onTransitionEnd () {
      this.$el.style = null
      this.resume()
      this.offTransitionEnd()
    },
    addTransitionEnd () {
      this.$el.addEventListener('webkitTransitionEnd', this.onTransitionEnd)
      this.$el.addEventListener('transitionEnd', this.onTransitionEnd)
    },
    offTransitionEnd () {
      this.$el.removeEventListener('webkitTransitionEnd', this.onTransitionEnd)
      this.$el.removeEventListener('transitionEnd', this.onTransitionEnd)
    },
    resume () {
      this.text = '下拉刷新'
      this.iconClass = ''
      this.iconPath = arrowIcon
      this.touch.resume('touch:move').resume('touch:end')
    },
    handleMove (distinct) {
      this.move(distinct)
      if (distinct >= this.distinct) {
        this.text = '松手刷新'
        this.iconClass = 'rotating'
      } else {
        this.text = '下拉刷新'
        this.iconClass = ''
      }
    },
    handleEnd (distinct) {
      if (distinct >= this.distinct) {
        this.text = '加载中..'
        this.iconClass = 'loading'
        this.iconPath = loadingIcon
        // this.moveTime(0.25)
        this.move(this.distinct)
        this.touch.pause('touch:move').pause('touch:end')
        this.stopCalled = false
        // 停止加载中..
        const stop = () => {
          clearTimeout(this.stopTimeId)
          if (this.stopCalled) return
          // 绑定动画监听回调
          this.addTransitionEnd()
          this.stopCalled = true
          this.moveTime(0.25)
          this.move(0)
        }
        this.stopTimeId = setTimeout(stop, 5000)
        this.refresh(stop)
      } else {
        // 绑定动画监听回调
        this.addTransitionEnd()
        // this.moveTime(0.5)
        this.move(0)
      }
    },
    move (distinct) {
      this.$el.style.webkitTransform = `translate3d(0, ${distinct}px ,0)`
      this.$el.style.transform = `translate3d(0, ${distinct}px ,0)`
    },
    moveTime (time) {
      this.$el.style.webkitTransitionDuration = `${time}s`
      this.$el.style.transitionDuration = `${time}s`
    }
  }
}
</script>

<style scoped>
.pulldown-refresh-wrapper {
    transition: all 0;
    margin-top: -1000px;
    color: #333;
    font-size: 32px;
}

.pulldown-background {
    position: relative;
    height: 1000px;
    background-color: #ddd;
}

.pulldown-action {
    position: absolute;
    left: 0;
    bottom: 20px;
    width: 100%;
    text-align: center;
}

.icon-loading {
    transition: transform 0.5s;
    width: 50px;
    height: 50px;
}

.icon-loading.rotating {
    transform: rotate(180deg);
}

.icon-loading.loading {
    animation: pulldownLoading 2s linear infinite;
}

@keyframes pulldownLoading {
  from {
      transform: rotate(0deg);
  }
  to {
      transform: rotate(360deg);
  }
}
</style>
