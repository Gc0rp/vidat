const VIDEO_INFO_TEMPLATE = `
<div>
  <div v-if="video.src" class="row q-mb-sm" style="min-height: 100px">
    <q-card-section class="col-md-4 col-sm-8">
      <video
        controls
        style="width: 100%"
        :src="video.src"
        @canplay="handleCanPlay"
      >
        Sorry, your browser doesn't support embedded videos.
      </video>
    </q-card-section>
    <q-card-section class="col-md-8 col-sm-4 row">
      <q-list class="col-md-6 col-sm-12">
        <q-item>
          <q-item-section class="text-center">Video Info</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Duration:</q-item-section>
          <q-item-section class="text-right">{{ video.duration }} s</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Width:</q-item-section>
          <q-item-section class="text-right">{{ video.width }} px</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Height:</q-item-section>
          <q-item-section class="text-right">{{ video.height }} px</q-item-section>
        </q-item>
      </q-list>
      <q-list class="col-md-6 col-sm-12">
        <q-item>
          <q-item-section class="text-center">Video</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleOpen">
          <q-item-section avatar><q-icon name="movie"></q-icon></q-item-section>
          <q-item-section class="text-right">Reopen</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleClose">
          <q-item-section avatar><q-icon name="close"></q-icon></q-item-section>
          <q-item-section class="text-right">Close</q-item-section>
        </q-item>
        <q-item>
          <q-item-section class="text-center">KeyFrames</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleGenerate">
          <q-item-section avatar><q-icon name="more_time"></q-icon></q-item-section>
          <q-item-section class="text-right">Generate</q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleExport">
          <q-item-section avatar><q-icon name="save"></q-icon></q-item-section>
          <q-item-section class="text-right">Export</q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-list class="col-12 row">
      <q-item>
        <q-item-section class="text-center">Keyframes:</q-item-section>
      </q-item>
      <div class="col row">
        <q-item
          class="rounded-borders q-px-none"
          v-for="keyframe in keyframeList"
          :key="keyframe">
          <q-chip class="q-ma-xs" color="primary" text-color="white">
             {{ keyframe }}
             <q-badge
              color="orange"
              floating style="top: -5px; right: 19px"
              v-if="keyframe === leftPanel.currentKeyframe"
             >L</q-badge>
             <q-badge
              color="orange"
              floating style="top: -5px; right: -6px"
              v-if="keyframe === rightPanel.currentKeyframe"
             >R</q-badge>
          </q-chip>
        </q-item>
      </div>
      <q-space></q-space>
      <q-btn-group flat>
        <q-btn flat @click="previousKeyframe" icon="keyboard_arrow_left"></q-btn>
        <q-btn flat @click="nextKeyframe" icon="keyboard_arrow_right"></q-btn>
    </q-btn-group>
    </q-list>
  </div>
  <q-btn flat class="absolute-center full-width" size="40px" @click="handleOpen" icon="movie" v-if="!video.src">Open</q-btn>
</div>
`

import utils from '../libs/utils.js'

export default {
  data: () => {
    return {}
  },
  methods: {
    ...Vuex.mapMutations([
      'setVideoSrc',
      'setVideoDuration',
      'setVideoWidth',
      'setVideoHeight',
      'setSecondPerKeyframe',
      'setLeftPanelCurrentKeyframe',
      'setRightPanelCurrentKeyframe',
    ]),
    handleOpen () {
      if (this.video.src) {
        utils.confirm('Are you sure to open a new video? You will LOSE all data!').onOk(() => {
          utils.importVideo().then(videoSrc => {
            this.setVideoSrc(videoSrc)
          })
        })
      } else {
        utils.importVideo().then(videoSrc => {
          this.setVideoSrc(videoSrc)
        })
      }
    },
    handleCanPlay (event) {
      this.setVideoDuration(event.target.duration)
      this.setVideoWidth(event.target.videoWidth)
      this.setVideoHeight(event.target.videoHeight)
      this.setSecondPerKeyframe(5)
    },
    handleClose () {
      utils.confirm('Are you sure to close? You will LOSE all data!').onOk(() => {
        this.setVideoSrc(null)
      })
    },
    handleGenerate () {
      utils.prompt(
        'Generate keyframes',
        'Generate keyframe every how many seconds? Integer bigger or equal to 1.',
        5,
        'number',
      ).onOk((secondPerKeyframe) => {
        if (secondPerKeyframe >= 1 && secondPerKeyframe % 1 === 0) {
          this.setSecondPerKeyframe(parseInt(secondPerKeyframe))
        } else {
          utils.notify('Please enter an integer bigger than 1.')
        }
      })
    },
    handleExport () {
      utils.notify('Not implemented yet!')
    },
    previousKeyframe () {
      const leftPanelCurrentKeyframe = this.leftPanel.currentKeyframe
      const rightPanelCurrentKeyframe = this.rightPanel.currentKeyframe
      if (leftPanelCurrentKeyframe - this.secondPerKeyframe < 0 ||
        rightPanelCurrentKeyframe - this.secondPerKeyframe < 0) {
        this.setLeftPanelCurrentKeyframe(0)
        this.setRightPanelCurrentKeyframe(this.secondPerKeyframe)
      } else if (rightPanelCurrentKeyframe - leftPanelCurrentKeyframe === this.secondPerKeyframe) {
        this.setLeftPanelCurrentKeyframe(leftPanelCurrentKeyframe - this.secondPerKeyframe)
        this.setRightPanelCurrentKeyframe(rightPanelCurrentKeyframe - this.secondPerKeyframe)
      } else {
        this.setLeftPanelCurrentKeyframe(leftPanelCurrentKeyframe - this.secondPerKeyframe)
        this.setRightPanelCurrentKeyframe(leftPanelCurrentKeyframe)
      }
    },
    nextKeyframe () {
      const leftPanelCurrentKeyframe = this.leftPanel.currentKeyframe
      const rightPanelCurrentKeyframe = this.rightPanel.currentKeyframe
      const lastKeyframe = this.keyframeList[this.keyframeList.length - 1]
      if (leftPanelCurrentKeyframe + this.secondPerKeyframe > lastKeyframe ||
        rightPanelCurrentKeyframe + this.secondPerKeyframe > lastKeyframe) {
        this.setLeftPanelCurrentKeyframe(lastKeyframe - this.secondPerKeyframe)
        this.setRightPanelCurrentKeyframe(lastKeyframe)
      } else if (rightPanelCurrentKeyframe - leftPanelCurrentKeyframe === this.secondPerKeyframe) {
        this.setLeftPanelCurrentKeyframe(leftPanelCurrentKeyframe + this.secondPerKeyframe)
        this.setRightPanelCurrentKeyframe(rightPanelCurrentKeyframe + this.secondPerKeyframe)
      } else {
        this.setLeftPanelCurrentKeyframe(leftPanelCurrentKeyframe)
        this.setRightPanelCurrentKeyframe(leftPanelCurrentKeyframe + this.secondPerKeyframe)
      }
    },
  },
  computed: {
    video () {
      return this.$store.state.annotation.video
    },
    secondPerKeyframe () {
      return this.$store.state.annotation.secondPerKeyframe
    },
    keyframeList () {
      return this.$store.state.annotation.keyframeList
    },
    leftPanel () {
      return this.$store.state.annotation.leftPanel
    },
    rightPanel () {
      return this.$store.state.annotation.rightPanel
    },
  },
  mounted () {
    this.setVideoSrc(null)
  },
  template: VIDEO_INFO_TEMPLATE,
}
