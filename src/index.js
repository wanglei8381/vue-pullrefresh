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
            isWaiting: false,//下拉刷新等待状态
            isClose: false,//下拉刷新关闭状态
            count: 0//动画执行的次数
        };
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
            let k = 0;
            const cxt = this.cxt;
            const self = this;
            return function __drawCircle() {
                cxt.clearRect(0, 0, 50, 50);
                // cxt.beginPath();
                // cxt.strokeStyle = '#EEEEEE'
                // cxt.arc(25, 25, 15, 0, 2 * Math.PI, false);
                // cxt.stroke();
                // cxt.closePath();

                cxt.beginPath();
                // cxt.strokeStyle = '#21DD44'
                cxt.arc(25, 25, 15, k * Math.PI, (k + 1.5) * Math.PI, false);
                cxt.stroke();
                cxt.closePath();
                k = k + 0.1;
                self.count = window.requestAnimationFrame(__drawCircle);
            };
        },
        handleMove: function (distinct) {
            if (distinct > 95) return;
            this.isWaiting = false;
            this.isClose = false;
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
                this.isWaiting = true;
                this.isClose = false;
                this.$dispatch('pull-to-refresh', 1);
            } else {
                this.isWaiting = false;
                this.isClose = true;
            }
        },
        close: function () {
            this.isWaiting = false;
            this.isClose = true;
            this.touch.resume('touch:move').resume('touch:end');
            window.cancelAnimationFrame(this.count);
        }
    },
    events: {
        'pull-to-refresh-close': function () {
            this.close();
        }
    },
    ready: function () {

        this.doms.rotateWrapper = this.$el.querySelector('#__rotate__wrapper');
        this.doms.rotateCanvas = this.$el.querySelector('#__rotate__canvas');
        let cxt = this.doms.rotateCanvas.getContext('2d');
        cxt.strokeStyle = this.config.color;
        cxt.fillStyle = this.config.color;
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
    }
};