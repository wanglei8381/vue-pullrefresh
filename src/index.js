/**
 * 下拉刷新页面
 */


require('./style.css');
let Touch = require('super-touch');

module.exports = {
    template: require('./template.html'),
    data: function () {
        return {
            config: {//canvas配置
                color: '#027CFF',
                lineWidth: 3,
                canvasHeight: 50,
                canvasWidth: 50
            },
            cxt: null,//canvas上下文
            doms: {//dom节点
            },
            count: 0//动画执行的次数
        };
    },
    props: {
        top: {
            type: Number,
            required: false,
            default: 0
        },
        color: {
            type: String,
            required: false,
            default: '#027CFF'
        }
    },
    methods: {
        drawArrowCircle: function (i) {
            if (i > 1.7) {
                return;
            }
            const cxt = this.cxt;
            cxt.globalAlpha = i / 2;
            //清除画布
            cxt.clearRect(0, 0, 50, 50);
            //画圆
            cxt.beginPath();
            cxt.arc(25, 25, 15, 0, i * Math.PI, false);
            cxt.stroke();
            //画箭头
            let x1 = 25 + 15 * Math.cos((i + 0.2) * Math.PI);
            let y1 = 25 + 15 * Math.sin((i + 0.2) * Math.PI);
            let x2 = 25 + 10 * Math.cos((i - 0.1) * Math.PI);
            let y2 = 25 + 10 * Math.sin((i - 0.1) * Math.PI);
            let x3 = 25 + 20 * Math.cos((i) * Math.PI);
            let y3 = 25 + 20 * Math.sin((i) * Math.PI);
            cxt.beginPath();
            cxt.moveTo(x1, y1);
            cxt.lineTo(x2, y2);
            cxt.lineTo(x3, y3);
            cxt.closePath();
            cxt.fill();
        },
        drawCircle: function () {
            const cxt = this.cxt;
            const _this = this;
            let index = 1;
            let a = 0;
            let flag = true;
            return function __drawCircle() {
                cxt.clearRect(0, 0, 50, 50);
                cxt.beginPath();
                if (flag) {
                    cxt.arc(25, 25, 15, a * Math.PI, easeInOut(index++, 0 + a, 1.7, 50) * Math.PI, false);
                } else {
                    cxt.arc(25, 25, 15, easeInOut(index++, 0 + a, 1.7, 50) * Math.PI, (1.7 + a) * Math.PI, false);
                }
                cxt.stroke();
                cxt.closePath();
                if (index >= 50) {
                    flag = !flag;
                    if (flag) {
                        a -= 0.4;
                    }
                    index = 1;
                }
                _this.count = requestAnimationFrame(__drawCircle);
            };
        },
        handleMove: function (distinct) {
            if (distinct > 95) return;
            this.doms.rotateWrapper.style.top = distinct + 'px';
            this.doms.rotateCanvas.style.transform = 'rotate(' + distinct * 3 + 'deg)';
            this.drawArrowCircle(distinct / 30);
        },
        handleEnd: function (distinct) {
            this.doms.rotateWrapper.removeAttribute('style');
            if (distinct >= 50) {
                this.touch.pause('touch:move').pause('touch:end');
                //调用动画
                window.requestAnimationFrame(this.drawCircle());
                this.waiting();
                this.$dispatch('pull-to-refresh', 1);
            } else {
                this.close();
            }
        },
        close: function () {
            this.classList.add('close');
        },
        waiting: function () {
            this.classList.add('waiting');
        }
    },
    events: {
        'pull-to-refresh-waiting': function () {
            this.waiting();
            window.requestAnimationFrame(this.drawCircle());
        },
        'pull-to-refresh-close': function () {
            this.classList.remove('waiting');
            this.close();
            this.touch.resume('touch:move').resume('touch:end');
            window.cancelAnimationFrame(this.count);
        }
    },
    ready: function () {
        this.doms.rotateWrapper = this.$el.querySelector('div');
        this.doms.rotateCanvas = this.$el.querySelector('canvas');
        this.classList = this.doms.rotateWrapper.classList;
        let cxt = this.doms.rotateCanvas.getContext('2d');
        cxt.strokeStyle = this.color;
        cxt.fillStyle = this.color;
        cxt.lineWidth = this.config.lineWidth;

        this.cxt = cxt;

        //到达页面顶部了吗
        var top = document.body.scrollTop === 0;
        var touch = new Touch();
        this.touch = touch;
        touch.start();

        touch.on('touch:move', (res)=> {
            if (top) {
                let deltaY = res.y2 - res.y1;
                if (deltaY < 0) return;
                res.e.preventDefault();
                let distinct = deltaY / 5;
                this.handleMove(distinct);
            }
        });

        touch.on('touch:end', (res)=> {
            let distinct = res.y2 - res.y1;
            this.handleEnd(distinct / 5);
        });

        touch.on('scroll', ()=> {
            top = document.body.scrollTop === 0;
        });

        this.doms.rotateWrapper.addEventListener('webkitTransitionEnd', ()=> {
            this.classList.remove('close');
        });
    }
};

function easeInOut(t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
}