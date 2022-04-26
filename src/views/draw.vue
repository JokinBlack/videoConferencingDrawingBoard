<template>
  <div class="container">
    <el-row class="tool-box" type="flex" justify="center" align="middle">
      <el-col :span="12" class="draw-left">
        <el-col :span="24" :offset="clientWidth < 1500 ? 4 : clientWidth < 1700 && clientWidth >= 1500 ? 5 : 10">
          <div class="literally" @mousewheel.ctrl.prevent="triggerZoom($event)"></div>
        </el-col>
        <el-col :span="24" :offset="clientWidth < 1500 ? 4 : clientWidth < 1700 && clientWidth >= 1500 ? 5 : 10">
          <transition name="slide-fade">
            <el-input
              type="textarea"
              v-show="jsonData"
              :autosize="{ minRows: 2, maxRows: 20}"
              class="canvas-json"
              placeholder="直接复制即可"
              v-model="jsonData"
              show-word-limit>
            </el-input>
          </transition>
        </el-col>
      </el-col>
      <el-col :span="12" class="draw-right">
        <el-col :span='24' :offset="1">
          <el-Button id="tool-pencil">画笔</el-Button>
          <el-Button id="tool-line">直线</el-Button>
          <el-Button id="tool-eraser">橡皮</el-Button>
          <el-Button id="tool-ellipse">圆形</el-Button>
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button id="tool-rectangle">矩形</el-Button>
          <el-Button id="tool-polygon">多边</el-Button>
          <el-Button id="tool-select-shape">选择</el-Button>
          <el-Button id="tool-text">文本</el-Button>
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button id="tool-eyedropper">吸管</el-Button>
          <el-Button id="tool-undo" @click="lc.undo()">后退</el-Button>
          <el-Button id="tool-redo" @click="lc.redo()">前进</el-Button>
          <el-Button id="tool-clear" @click="lc.clear()">清屏</el-Button>
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button id="tool-pan">移动</el-Button>
          <el-col :span='24'>
            画笔大小：
            <input type="text" v-model.number="inputNum" @keyup="inputNumChange" class="pencil-num">
            <span class="gt100" v-if="sizeIsNumber && inputNum > 100">疯了吧🥴</span>
          </el-col>
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button title="画布背景颜色" @click="lc.setColor('background', colorInput)">画布颜色</el-Button>
          <el-Input type="color" name="canvas-color" class="background-select" v-model="canvasBgColor" @input="canvasColorChange"></el-Input> 
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button title="线条颜色" @click="lc.setColor('primary', primaryBgColor)">主要颜色</el-Button>
          <el-Input type="color" name="primary-color" class="background-select" v-model="primaryBgColor" @input="primaryColorChange"></el-Input>
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button title="矩形、圆形、多边形框内背景色" @click="lc.setColor('secondary', secondaryBgColor)">次要颜色</el-Button>
          <el-Input type="color" name="secondary-color" class="background-select" v-model="secondaryBgColor" @input="secondaryColorChange"></el-Input>
        </el-col>
        <el-col :span="24" :offset="1">
          
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button class="right_10" @click="lc.setZoom(suo+=Number(zoomBig))">点击放大</el-Button> 
          放大倍率：<input type="text" class="pencil-num background-write" placeholder="输入放大倍率" v-model="zoomBig">
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button class="right_10" @click="lc.setZoom(suo-=Number(zoomSmall))">点击缩小</el-Button>
          缩小倍率：<input type="text" class="pencil-num background-write" placeholder="输入缩小倍率" v-model="zoomSmall">
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button class="right_10" @click="lc.setPan(moveX, moveY)">移动至指定的位置</el-Button>
          X轴：<input class="pencil-num background-write" type="text" v-model.number="moveX">
          Y轴：<input class="pencil-num background-write" type="text" v-model.number="moveY">
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button class="right_10" @click="lc.pan(moveSelfX, moveSelfY)">根据当前位置移动</el-Button>
          X轴：<input class="pencil-num background-write" type="text" v-model.number="moveSelfX">
          Y轴：<input class="pencil-num background-write" type="text" v-model.number="moveSelfY">
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button class="right_10" title="外部盒子大小不变" @click="lc.setImageSize(inBoxWidth, inBoxHeight)">设置绘制区域尺寸</el-Button>
          宽度：<input class="pencil-num background-write" type="text" v-model.number="inBoxWidth">
          高度：<input class="pencil-num background-write" type="text" v-model.number="inBoxHeight">
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button @click="setImage">放入一张随意图片</el-Button>
        </el-col>
        <el-col :span="24" :offset="1">
          <el-Button @click="getCanvasInfo">获取画布JSON数据</el-Button>
        </el-col>
        
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      lc: '',
      canvasBgColor: '#cccccc',
      primaryBgColor: '#000000',
      secondaryBgColor: '#ffffff',
      suo: 1,
      zoomBig: 0.1,
      zoomSmall: 0.1,
      moveX: 0,
      moveY: 0,
      moveSelfX: 0,
      moveSelfY: 0,
      inBoxWidth: 400,
      inBoxHeight: 400,
      inputNum: 5,
      zoomTimes: 3, // 滚轮滚动放大/缩小的倍数
      sizeIsNumber: true,
      jsonData: '',
      clientWidth: 0
    }
  },
  computed: {
    colorInput () {
      return this.canvasBgColor
    }
  },
  created () {
    this.clientWidth = document.body.clientWidth
  },
  mounted () {
    var that = this
    console.log('lc从哪里来',LC)
    this.lc = LC.init(document.getElementsByClassName('literally')[0]) // 初始化画布
    window.Ellipse = new LC.tools.Ellipse(this.lc);
    var tools = [
      {
        name: 'pencil',
        el: document.getElementById('tool-pencil'),
        tool: new LC.tools.Pencil(this.lc)
      },
      {
        name: 'line',
        el: document.getElementById('tool-line'),
        tool: new LC.tools.Line(this.lc)
      },
      {
        name: 'eraser',
        el: document.getElementById('tool-eraser'),
        tool: new LC.tools.Eraser(this.lc)
      },
      {
        name: 'ellipse',
        el: document.getElementById('tool-ellipse'),
        tool: new LC.tools.Ellipse(this.lc)
      },
      {
        name: 'rectangle',
        el: document.getElementById('tool-rectangle'),
        tool: new LC.tools.Rectangle(this.lc)
      },
      {
        name: 'polygon',
        el: document.getElementById('tool-polygon'),
        tool: new LC.tools.Polygon(this.lc)
      },
      {
        name: 'select-shape',
        el: document.getElementById('tool-select-shape'),
        tool: new LC.tools.SelectShape(this.lc)
      },
      {
        name: 'text',
        el: document.getElementById('tool-text'),
        tool: new LC.tools.Text(this.lc)
      },
      {
        name: 'eyedropper',
        el: document.getElementById('tool-eyedropper'),
        tool: new LC.tools.Eyedropper(this.lc)
      },
      {
        name: 'undo',
        el: document.getElementById('tool-undo')
      },
      {
        name: 'redo',
        el: document.getElementById('tool-redo')
      },
      {
        name: 'clear',
        el: document.getElementById('tool-clear')
      },
      {
        name: 'pan',
        el: document.getElementById('tool-pan'),
        tool: new LC.tools.Pan(this.lc)
      }
    ]
    var activateTool = function(t) {
      if (t.tool) that.lc.setTool(t.tool);

      tools.forEach(function(t2) {
        if (t == t2) {
          t2.el.style.backgroundColor = 'yellow';
        } else {
          t2.el.style.backgroundColor = 'transparent';
        }
      });
    }
    tools.forEach(function(t) {
      t.el.style.cursor = "pointer";
      t.el.onclick = function(e) {
        e.preventDefault();
        activateTool(t);
      };
    });
    activateTool(tools[0]);
  },
  methods: {
    triggerZoom (event) {
      let isDown = true
      isDown = event.wheelDelta ? event.wheelDelta < 0 : event.detail > 0
      if (isDown) {
        if (this.suo - Number(this.zoomSmall) < 0.1) return
        this.lc.setZoom(this.suo -= this.zoomSmall/this.zoomTimes)
      } else {
        this.lc.setZoom(this.suo += Number(this.zoomBig/this.zoomTimes))
      }
    },
    canvasColorChange (color) {
      this.lc.setColor('background', color)
    },
    primaryColorChange (color) {
      this.lc.setColor('primary', color)
    },
    secondaryColorChange (color) {
      this.lc.setColor('secondary', color)
    },
    setImage () {
      let image = new Image()
      image.src = 'http://q98lq5nwy.bkt.clouddn.com/see01.jpg' 
      this.lc.saveShape(LC.createShape('Image', { x: 0, y: 0, scale: 1.0, image: image }))
    },
    getCanvasInfo () {
      this.jsonData = JSON.stringify(this.lc.getSnapshot())
    },
    inputNumChange () {
      this.sizeIsNumber = typeof this.inputNum === 'number' && !isNaN(this.inputNum)
      if (!this.sizeIsNumber || this.inputNum > 100) return
      this.lc.trigger('setStrokeWidth', this.inputNum)
    }
  }
}
</script>

<style scoped lang="less">
.container {
  min-width: 1366px;
}
.pencil-num {
  width: 220px;
  height: 30px;
  font-size: 16px;
  background: #eee;
  border: none;
  outline: none;
  border-bottom: 1px solid #ddd;
  position: relative;
  transition: all 0.25s;
  &:focus {
    border-bottom: 1px solid #409EFF;
    transition: all 0.25s;
  }
}

.gt100 {
  color: rgb(233, 152, 47);
}

.tool-box {
  .draw-left {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    border-radius: 10px;
  }
}

.literally {
  width: 600px;
  height: 400px;
  margin-bottom: 8px;
  border: 3px solid transparent;
  border-image: linear-gradient(rgb(209, 124, 14) , white , rgb(5, 235, 158))1 10 1;
  box-sizing: border-box;
  padding: 15px;
}

.style-v-m {
  vertical-align: middle;
  margin: 10px;
}

.background-select {
  &:extend(.style-v-m);
  width: 100px;
}

.background-write {
  width: 120px;
  &:extend(.style-v-m);
}

.canvas-json {
  width: 600px;
  transition: all 0.8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

button {
  margin-bottom: 8px;
}
</style>
