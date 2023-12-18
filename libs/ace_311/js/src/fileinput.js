/**
 * --------------------------------------------------------------------------
 * Ace (v3.1.1): fileinput.js
 * Custom styling for default browser file input
*/

import $ from 'jquery'
import bootstrap from 'bootstrap'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
*/

const NAME = 'aceFileInput'
const VERSION = '3.1.1'
const DATA_KEY = 'ace.file'
const EVENT_KEY = `.${DATA_KEY}`

const Event = {
  // PREVIEW: `preview${EVENT_KEY}`,
  INVALID: `invalid${EVENT_KEY}`,
  RESET: `reset${EVENT_KEY}`,
  PREVIEW_FAILED: `preview_failed${EVENT_KEY}`
}

const Default = {
  style: false,
  persistent: false,

  container: 'border-1 brc-grey-l2 brc-h-warning-m1',

  btnChooseClass: 'bgc-default text-white px-2 pt-2 text-90 my-1px mr-1px',
  btnChangeClass: 'bgc-blue text-white px-2 pt-2 text-90 my-1px mr-1px',

  btnChooseText: 'Choose',
  btnChangeText: 'Change',

  placeholderClass: 'text-grey-m2 px-1',
  placeholderText: 'No file chosen',
  placeholderIcon: '<i class="fa fa-upload bgc-grey-m1 text-white w-4 py-2 text-center"></i>',

  iconClass: 'mx-2px',

  reset: '',
  resetText: '',
  resetIcon: '<i class="fa fa-times"></i>',

  droppable: false,
  thumbnail: false, // large, fit, small
  previewImage: true,

  allowExt: null,
  denyExt: null,
  allowMime: null,
  denyMime: null,
  maxSize: null,

  previewSize: false,
  previewWidth: false,
  previewHeight: false,

  // callbacks
  beforeChange: null,

  fileIcons: {
    file: '<i class="fa fa-file bgc-grey-m1 text-white w-4 py-2 text-center"></i>',
    image: '<i class="far fa-image bgc-purple-m1 text-white w-4 py-2 text-center"></i>',
    video: '<i class="fas fa-video bgc-success-m1 text-white w-4 py-2 text-center"></i>',
    audio: '<i class="fas fa-music bgc-pink-m1 text-white w-4 py-2 text-center"></i>',
    document: '<i class="far fa-file-alt bgc-default-d1 text-white w-4 py-2 text-center"></i>',
    archive: '<i class="far fa-file-archive bgc-warning text-white w-4 py-2 text-center"></i>',
    code: '<i class="fas fa-code file-code bgc-secondary text-white w-4 py-2 text-center"></i>'
  }
}

const DefaultType = {
  persistent: 'boolean',

  style: '(boolean|string)',

  btn: '(string|undefined)',
  container: '(string|undefined)',
  icon: '(string|undefined)',

  placeholderText: '(string|undefined)',
  placeholderIcon: '(string|undefined)',
  btnChooseText: '(string|undefined)',
  btnChangeText: '(string|undefined)',

  reset: '(string|undefined)',
  resetText: '(string|undefined)',
  resetIcon: '(string|undefined)',

  droppable: 'boolean',
  thumbnail: '(boolean|string)',
  previewImage: 'boolean',

  allowExt: '(string|null)',
  denyExt: '(string|null)',
  allowMime: '(string|null)',
  denyMime: '(string|null)',
  maxSize: '(number|null)',

  previewSize: '(boolean|number)',
  previewWidth: '(boolean|number)',
  previewHeight: '(boolean|number)',

  fileIcons: '(object|null)',

  // callbacks
  beforeChange: '(function|null)'
}

const PreviewError = {
  FILE_LOAD_FAILED: 1,
  IMAGE_LOAD_FAILED: 2,
  THUMBNAIL_FAILED: 3
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class FileInput {
  constructor (element, config) {
    this.settings = this._getConfig(config)
    this.settings.fileIcons = $.extend({}, Default.fileIcons, this.settings.fileIcons)

    this.fileList = []
    this.selectMethod = ''

    this._hasMultiple = 'multiple' in document.createElement('INPUT')
    this._hasFileList = 'FileList' in window// file list enabled in modern browsers
    this._hasFileReader = 'FileReader' in window
    this._hasFile = 'File' in window

    this.element = element
    this.$element = $(element)
    this.disabled = false
    this.canReset = true

    this._hasAcceptAttr = this.element.getAttribute('accept') !== null

    this.$element
      .off('change.aceInnerCall')
      .on('change.aceInnerCall', (e, aceInnerCall) => {
        if (this.disabled) return

        if (aceInnerCall === true) return// this change Event is called from within this class (_enableFileDrop) and extra checkings are taken care of there
        return this._handleOnChange()
      })

    const parentLabel = this.$element.closest('label').addClass('d-block')
    const tagName = parentLabel.length === 0 ? 'label' : 'span'// if not inside a "LABEL" tag, use "LABEL" tag, otherwise use "SPAN"
    this.$element.wrap('<' + tagName + ' class="ace-file-input" />')

    this.$wrap = this.$element.parent()

    this._applySettings()
  }

  // Getters
  static get VERSION () {
    return VERSION
  }

  static get DefaultType () {
    return DefaultType
  }

  _getConfig (config, Default) {
    config = {
      ...Default,
      ...config
    }
    bootstrap.Util.typeCheckConfig(NAME, config, DefaultType)
    return config
  }

  _applySettings () {
    this._isMulti = this.$element.attr('multiple') && this._hasMultiple
    this._isDropStyle = this.settings.style === 'drop'

    if (this._isDropStyle) {
      if (!this.settings.thumbnail) this.settings.thumbnail = 'small'
      this.$wrap.addClass('ace-file-multiple')
    } else {
      this.$wrap.removeClass('ace-file-multiple')
    }

    this.$wrap.find('*:not(input[type=file])').remove()// remove all except our input, good for when changing settings

    const placeholder = `<div class="ace-file-placeholder h-100">
<span class="ace-file-icon align-self-center ${this.settings.iconClass || ''}">
  ${this.settings.placeholderIcon || ''}
</span>
<span class="ace-file-name ${this.settings.placeholderClass || ''}">
  ${this.settings.placeholderText}
</span>` + (!this._isDropStyle ? `<span class="ace-file-btn ml-auto ${this.settings.btnChooseClass || ''}">${this.settings.btnChooseText}</span>` : '') + '</div>'

    this.$element.after(`<div class="ace-file-container d-flex flex-column ${this.settings.container || ''}">${placeholder}</div>`)

    this.$container = this.$element.next()

    if (this.settings.reset !== false) {
      const remove = this.settings.reset.length > 0 ? this.settings.reset : (!this._isDropStyle ? 'position-rc text-danger mr-n25 w-3 radius-2 border-1 brc-h-danger-m4 text-center' : 'position-tr bgc-white text-danger mt-n25 mr-n25 w-4 h-4 text-center pt-2px radius-round border-2 brc-grey-m4 brc-h-danger-m3')

      const btn = $(`<a title="${this.settings.resetText || ''}" class="remove ${remove}" href="#">${this.settings.resetIcon}</a>`).appendTo(this.$wrap)

      if (this.settings.resetText) btn.tooltip({ container: 'body' })

      btn.on('click', (e) => {
        e.preventDefault()
        if (!this.canReset) return false

        let event
        this.$element.trigger(event = new $.Event(Event.RESET))
        if (event.isDefaultPrevented()) return false

        this.resetInput()
        this.stopLoading()

        return false
      })
    }

    if (this.settings.droppable && this._hasFileList) {
      this._enableFileDrop()
    }

    // set 'accept' attribute if not set
    if (!this._hasAcceptAttr) {
      this._setAcceptAttr(this.settings.allowExt, this.settings.allowMime)
    }
  }

  showFileList ($files, innerCall) {
    const files = $files || this.fileList
    if (!files || !files.length) return

    /// ///////////////////////////////////////////////////////////////
    if (!this.settings.persistent) {
      this.resetInputUI()
    }

    this.$container.addClass('selected')
    this.$container.find('.ace-file-placeholder').addClass('d-none')

    for (let i = 0; i < files.length; i++) {
      let filename = ''; let format = false
      if (typeof files[i] === 'string') filename = files[i]
      else if (this._hasFile && files[i] instanceof window.File) filename = $.trim(files[i].name)
      else if (files[i] instanceof Object && Object.prototype.hasOwnProperty.call(files[i], 'name')) {
        // format & name specified by user (pre-displaying name, etc)
        filename = files[i].name
        if (Object.prototype.hasOwnProperty.call(files[i], 'type')) format = files[i].type
        if (!Object.prototype.hasOwnProperty.call(files[i], 'path')) files[i].path = files[i].name
      } else continue

      let index = filename.lastIndexOf('\\') + 1
      if (index === 0) index = filename.lastIndexOf('/') + 1
      filename = filename.substr(index)

      if (!format) {
        if ((/\.(jpe?g|png|gif|svg|bmp|tiff?|webp)$/i).test(filename)) {
          format = 'image'
        } else if ((/\.(mpe?g|flv|mov|avi|swf|mp4|mkv|webm|wmv|3gp)$/i).test(filename)) {
          format = 'video'
        } else if ((/\.(mp3|ogg|wav|wma|amr|aac)$/i).test(filename)) {
          format = 'audio'
        } else if ((/\.(pdf|docx?|rtf|txt)$/i).test(filename)) {
          format = 'document'
        } else if ((/\.(zip|rar|tar)$/i).test(filename)) {
          format = 'archive'
        } else if ((/\.(html?|js|s?css|less|php|py|aspx?|rb|c|cpp|java|cs)$/i).test(filename)) {
          format = 'code'
        } else format = 'file'
      }

      const fileIcon = this.settings.fileIcons[format]

      let className = 'ace-file-item d-flex h-100'
      if (this.settings.thumbnail) className += ` ${this.settings.thumbnail !== 'small' ? 'flex-column my-2px py-2' : 'mx-1 py-1'} align-items-center`

      const label = $(`<div class="${className}">
<span class="ace-file-icon align-self-center ${this.settings.iconClass || ''}">${fileIcon}</span>
<span class="ace-file-name ${this.settings.thumbnail && this.settings.thumbnail !== 'small' ? 'px-2' : 'px-1'}">${filename}</span>` +
      (!this._isDropStyle ? `<span class="ace-file-btn ml-auto ${this.settings.btnChangeClass || ''}">${this.settings.btnChangeText}</span>` : '') +
      '</div>').appendTo(this.$container)

      const type = (innerCall === true && this._hasFile && files[i] instanceof window.File) ? $.trim(files[i].type) : ''
      const canPreview = this.settings.previewImage !== false && this._hasFileReader && this.settings.thumbnail					&&
					((type.length > 0 && type.match('image')) || (type.length === 0 && format === 'image'))// the second one is for older Android's default browser which gives an empty text for file.type
      if (canPreview) {
        $.when(this._previewImage(files[i], label))
        // .done( ()  => {
        // if( this.settings.thumbnail === 'small' ) label.find('.ace-file-icon').addClass('thumbnail-img');
        // })
          .fail((result) => {
            this.$element.trigger(Event.PREVIEW_FAILED, { filename: filename, code: result.code })
          })
      }
    }
  }

  resetInput () {
    this.resetInputUI()
    this.resetInputField()
    this.resetInputData()

    this.$container.removeClass('selected')
  }

  resetInputUI () {
    this.$container.find('div:not(.ace-file-placeholder)').remove()
    this.$container.find('.ace-file-placeholder').removeClass('d-none')

    // this.resetInputData();
  }

  resetInputField () {
    // http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery/13351234#13351234
    this.$element.wrap('<form>').parent().each((index, formEl) => {
      formEl.reset()
    })
    this.$element.unwrap()

    // when reset is called on this temporary inner form
    // only **IE10** triggers 'reset' on the outer form as well
    // and as we have mentioned to reset input on outer form reset
    // it causes infinite recusrsion by coming back to resetInputField
    // thus calling reset again and again and again
    // so because when "reset" button of outer form is hit, file input is automatically reset
    // we just resetInputUI to avoid recursion
  }

  resetInputData () {
    this.fileList = []
    this.selectMethod = ''

    if (this.$element.data('ace_input_files')) {
      this.$element.removeData('ace_input_files')
      this.$element.removeData('ace_input_method')
    }
  }

  enableReset () {
    this.canReset = true
  }

  disableReset () {
    this.canReset = false
  }

  disable () {
    this.disabled = true
    this.$element.attr('disabled', 'disabled').addClass('disabled')
  }

  enable () {
    this.disabled = false
    this.$element.removeAttr('disabled').removeClass('disabled')
  }

  files () {
    return this.fileList.length > 0 ? this.fileList : null
  }

  method () {
    return this.selectMethod
  }

  updateSettings (newSettings) {
    this.settings = $.extend({}, this.settings, newSettings)
    this._applySettings()
  }

  startLoading (loadingHtml = '<i class="overlay-content fa fa-spin fa-spinner text-white fa-2x"></i>') {
    let loader = this.$wrap.find('.ace-file-overlay')
    if (loader.length === 0) {
      loader = $('<div class="ace-file-overlay text-center"></div>').appendTo(this.$wrap)
      loader.on('click', (e) => {
        e.stopImmediatePropagation()
        e.preventDefault()
        return false
      })

      this.element.setAttribute('readonly', 'true')// for IE
    }
    loader.empty().append(loadingHtml)
  }

  stopLoading () {
    this.$wrap.find('.ace-file-overlay').remove()
    this.element.removeAttribute('readonly')
  }

  _enableFileDrop () {
    const dropbox = this.$element.parent()

    dropbox
      .off('dragenter')
      .on('dragenter', (e) => {
        e.preventDefault()
        e.stopPropagation()
      })
      .off('dragover')
      .on('dragover', (e) => {
        e.preventDefault()
        e.stopPropagation()
      })
      .off('drop')
      .on('drop', (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (this.disabled) return

        const dt = e.originalEvent.dataTransfer
        let tmpFileList = dt.files
        if (!this._isMulti && tmpFileList.length > 1) { // single file upload, but dragged multiple files
          const tmpfiles = []
          tmpfiles.push(tmpFileList[0])
          tmpFileList = tmpfiles// keep only first file
        }

        tmpFileList = this._processFiles(tmpFileList, true)// true means files have been dropped
        if (tmpFileList === false) return false

        this.$element.data('ace_input_method', 'drop')
        this.selectMethod = 'drop'

        // const fileArray = [...tmpFileList]
        const fileArray = []
        for (let f = 0; f < tmpFileList.length; f++) fileArray.push(tmpFileList[f])

        if (this.settings.persistent) {
          this.fileList = this.fileList.concat(fileArray)
        } else {
          this.fileList = fileArray
        }
        this.$element.data('ace_input_files', this.fileList)
        this.$element.data('ace_input_method', this.selectMethod)

        this.showFileList(fileArray, true)

        this.$element.triggerHandler('change', [true])// true means aceInnerCall
        return true
      })
  }

  /// ///////////

  _handleOnChange () {
    let tmpFileList = this.element.files || [this.element.value]// make it an array

    tmpFileList = this._processFiles(tmpFileList, false)// false means files have been selected, not dropped
    if (tmpFileList === false) return false

    // const fileArray = [...tmpFileList];
    const fileArray = []
    for (let f = 0; f < tmpFileList.length; f++) fileArray.push(tmpFileList[f])

    this.selectMethod = 'select'

    if (this.settings.persistent) {
      this.fileList = this.fileList.concat(fileArray)
    } else {
      this.fileList = fileArray
    }

    this.$element.data('ace_input_files', this.fileList)
    this.$element.data('ace_input_method', this.selectMethod)

    this.showFileList(fileArray, true)

    return true
  }

  _previewImage (file, label) {
    const $icon = label.find('.ace-file-icon')// it should be out of onload, otherwise all onloads may target the same $icon because of delays
    $icon.empty()

    const deferred = new $.Deferred()

    const getImage = function (src, $file) {
      $icon.prepend("<img style='display: none;' />")
      const img = $icon.find('img:last').get(0)

      $(img).one('load', function () {
        imgLoaded(img, $file)
      }).one('error', function () {
        imgFailed(img)
      })

      img.src = src
    }
    const This = this
    const imgLoaded = function (img, $file) { // if image loaded successfully
      let size = This.settings.previewSize

      if (!size) {
        if (This.settings.previewWidth || This.settings.previewHeight) {
          size = { previewWidth: This.settings.previewWidth, previewHeight: This.settings.previewHeight }
        } else {
          size = 50
          if (This.settings.thumbnail === 'large') size = 150
        }
      }
      if (This.settings.thumbnail === 'fit') size = $icon.parent().width()
      else if (typeof size === 'number') size = parseInt(Math.min(size, $icon.parent().width()))

      const svg = /svg/.test($file.type)
      const thumb = !svg ? This._getThumbnail(img, size, $file.type) : false//, file.type;
      if (thumb === null) {
        // if making thumbnail fails
        $(This).remove()
        deferred.reject({ code: PreviewError.THUMBNAIL_FAILED })
        return
      }

      const showPreview = true
      /**
      // add width/height info to "file" and trigger preview finished event for each image!
      if ($file && $file instanceof window.File) {
        if (thumb) {
          $file.width = thumb.width
          $file.height = thumb.height
        }

        var event
        This.$element.trigger(event = new $.Event(Event.PREVIEW), { file: $file })
        if (event.isDefaultPrevented()) showPreview = false
      }
      */

      if (showPreview) {
        if (svg) {
          if (This.settings.thumbnail === 'small') {
            $(img).css({ width: size })
          } else {
            if (img.width > img.height) { $(img).css({ width: size }) } else $(img).css({ height: size })
          }
        } else {
          let w = thumb.previewWidth; let h = thumb.previewHeight

          if (This.settings.thumbnail === 'small') { w = h = parseInt(Math.max(w, h)) } else $icon.addClass('thumbnail-large')

          $(img).css({ background: 'url(' + thumb.src + ') center no-repeat', width: w, height: h })
            .data('src', thumb.src)
            .attr({ src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==' })
        }

        img.style.display = ''
      }

      /// ////////////////
      deferred.resolve()
    }
    const imgFailed = function () {
      // for example when a file has image extenstion, but format is something else
      $icon.find('img').remove()
      deferred.reject({ code: PreviewError.IMAGE_LOAD_FAILED })
    }

    if (this._hasFile && file instanceof window.File) {
      const reader = new window.FileReader()
      reader.onload = function (e) {
        getImage(e.target.result, file)
      }
      reader.onerror = function (e) {
        deferred.reject({ code: PreviewError.FILE_LOAD_FAILED })
      }
      reader.readAsDataURL(file)
    } else {
      if (file instanceof Object && Object.prototype.hasOwnProperty.call(file, 'path')) {
        getImage(file.path, file)// file is a file name (path) --- this is used to pre-show user-selected image
      }
    }

    return deferred.promise()
  }

  /// //////////

  _getThumbnail (img, size, type) {
    let imgWidth = img.width; let imgHeight = img.height

    //* *IE10** is not giving correct width using img.width so we use $(img).width()
    imgWidth = imgWidth > 0 ? imgWidth : $(img).width()
    imgHeight = imgHeight > 0 ? imgHeight : $(img).height()

    let previewSize = false; let previewHeight = false; let previewWidth = false
    if (typeof size === 'number') previewSize = size
    else if (size instanceof Object) {
      if (size.previewWidth && !size.previewHeight) previewWidth = size.previewWidth
      else if (size.previewHeight && !size.previewWidth) previewHeight = size.previewHeight
      else if (size.previewWidth && size.previewHeight) {
        previewWidth = size.previewWidth
        previewHeight = size.previewHeight
      }
    }

    if (previewSize) {
      if (imgWidth > imgHeight) {
        previewWidth = previewSize
        previewHeight = parseInt(imgHeight / imgWidth * previewWidth)
      } else {
        previewHeight = previewSize
        previewWidth = parseInt(imgWidth / imgHeight * previewHeight)
      }
    } else {
      if (!previewHeight && previewWidth) {
        previewHeight = parseInt(imgHeight / imgWidth * previewWidth)
      } else if (previewHeight && !previewWidth) {
        previewWidth = parseInt(imgWidth / imgHeight * previewHeight)
      }
    }

    let dataURL
    try {
      const canvas = document.createElement('canvas')
      canvas.width = previewWidth; canvas.height = previewHeight
      const context = canvas.getContext('2d')
      context.imageSmoothingQuality = 'medium'
      context.drawImage(img, 0, 0, imgWidth, imgHeight, 0, 0, previewWidth, previewHeight)
      dataURL = canvas.toDataURL(type, 0.8)
      // dataURL = canvas.toDataURL();
    } catch (e) {
      dataURL = null
    }
    if (!dataURL) return null

    // there was only one image that failed in firefox completely randomly! so let's double check things
    if (!(/^data:image\/(png|jpe?g|gif|svg);base64,[0-9A-Za-z+/=]+$/.test(dataURL))) dataURL = null
    if (!dataURL) return null

    return { src: dataURL, previewWidth: previewWidth, previewHeight: previewHeight, width: imgWidth, height: imgHeight }
  }

  _processFiles (tmpFileList, dropped) {
    let ret = this._checkFileList(tmpFileList, dropped)
    if (ret === -1) {
      this.resetInput()
      return false
    }
    if (!ret || ret.length === 0) {
      if (!this.$element.data('ace_input_files')) this.resetInput()
      // if nothing selected before, reset because of the newly unacceptable (ret=false||length=0) selection
      // otherwise leave the previous selection intact?!!!
      return false
    }
    if (ret instanceof Array || (this._hasFileList && ret instanceof window.FileList)) tmpFileList = ret

    ret = true

    if (this.settings.beforeChange) ret = this.settings.beforeChange.call(this.element, tmpFileList, dropped)
    if (ret === -1) {
      this.resetInput()
      return false
    }
    if (!ret || ret.length === 0) {
      if (!this.$element.data('ace_input_files')) this.resetInput()
      return false
    }

    // inside beforeChange you can return a modified File Array as result
    if (ret instanceof Array || (this._hasFileList && ret instanceof window.FileList)) tmpFileList = ret

    return tmpFileList
  }

  /// ///////

  _checkFileList (files, dropped) {
    const allowExt = this._getExtRegex(this.settings.allowExt)

    const denyExt = this._getExtRegex(this.settings.denyExt)

    const allowMime = this._getMimeRegex(this.settings.allowMime)

    const denyMime = this._getMimeRegex(this.settings.denyMime)

    const maxSize = this.settings.maxSize || false

    if (!(allowExt || denyExt || allowMime || denyMime || maxSize)) return true// no checking required

    const safeFiles = []
    const errorList = {}
    // for (const file of files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // file is either a string(file name) or a File object
      const filename = !this._hasFile ? file : file.name
      if (allowExt && !allowExt.test(filename)) {
        // extension not matching whitelist, so drop it
        if (!('ext' in errorList)) errorList.ext = []
        errorList.ext.push(filename)

        continue
      } else if (denyExt && denyExt.test(filename)) {
        // extension is matching blacklist, so drop it
        if (!('ext' in errorList)) errorList.ext = []
        errorList.ext.push(filename)

        continue
      }

      let type
      if (!this._hasFile) {
        // in browsers that don't support FileReader API
        safeFiles.push(file)
        continue
      } else if ((type = $.trim(file.type)).length > 0) {
        // there is a mimetype for file so let's check against are rules
        if (allowMime && !allowMime.test(type)) {
          // mimeType is not matching whitelist, so drop it
          if (!('mime' in errorList)) errorList.mime = []
          errorList.mime.push(filename)
          continue
        } else if (denyMime && denyMime.test(type)) {
          // mimeType is matching blacklist, so drop it
          if (!('mime' in errorList)) errorList.mime = []
          errorList.mime.push(filename)
          continue
        }
      }

      if (maxSize && file.size > maxSize) {
        // file size is not acceptable
        if (!('size' in errorList)) errorList.size = []
        errorList.size.push(filename)
        continue
      }

      safeFiles.push(file)
    }

    if (safeFiles.length === files.length) return files// return original file list if all are valid

    /// //////
    const errorCount = { ext: 0, mime: 0, size: 0 }
    if ('ext' in errorList) errorCount.ext = errorList.ext.length
    if ('mime' in errorList) errorCount.mime = errorList.mime.length
    if ('size' in errorList) errorCount.size = errorList.size.length

    let event
    this.$element.trigger(
      event = new $.Event(Event.INVALID),
      {
        fileCount: files.length,
        invalidCount: files.length - safeFiles.length,
        errorList: errorList,
        errorCount: errorCount,
        dropped: dropped
      }
    )
    if (event.isDefaultPrevented()) return -1// it will reset input
    /// ///////

    return safeFiles// return safeFiles
  }

  _setAcceptAttr (ext = '', mime = '') {
    if (ext) {
      if (Array.isArray(ext)) ext = ext.join(',.')
      else ext = ext.replace(/\|/g, ',.')
      ext = '.' + ext
    }

    if (mime) {
      if (Array.isArray(mime)) mime = mime.join(',')
      // replace `/\w+` with `/*` ... for example, `image/\w+` becomes `image/*`
      else mime = mime.replace(/\|/g, ',').replace(/\/\\w+/g, '/*')
    }

    let accept = (ext || '') + (ext && mime ? ',' : '') + (mime || '')
    accept = accept.replace(/\s/g, '')
    if (accept) this.element.setAttribute('accept', accept)
  }

  _getExtRegex (ext) {
    if (!ext) return null
    if (Array.isArray(ext)) ext = ext.join('|')
    if (ext.length === 0) return null
    return new RegExp('\\.(?:' + ext + ')$', 'i')
  }

  _getMimeRegex (mime) {
    if (!mime) return null
    if (Array.isArray(mime)) mime = mime.join('|')
    if (mime.length === 0) return null
    // replace `/*` with `/\w+` ... for example, `image/*` becomes `image/\w+`
    return new RegExp('^(?:' + mime.replace(/\/\*/g, '/\\w+').replace(/\//g, '\\/') + ')$', 'i')
  }

  static _jQueryInterface (config, value) {
    let retval
    const reteach = this.each(function () {
      const matches = this.matches ? this.matches('input[type=file]') : (this.msMatchesSelector ? this.msMatchesSelector('input[type=file]') : false)
      if (!matches) return

      const $this = $(this)
      let data = $this.data(DATA_KEY)
      const _config = {
        ...Default,
        ...$this.data(),
        ...typeof config === 'object' && config ? config : {}
      }

      if (!data) {
        data = new FileInput(this, _config)
        $this.data(DATA_KEY, data)
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        retval = data[config](value)
      }
    })

    return (typeof retval !== 'undefined') ? retval : reteach
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
*/

if (typeof $ !== 'undefined') {
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = FileInput._jQueryInterface
  $.fn[NAME].Constructor = FileInput
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return FileInput._jQueryInterface
  }
}

export default FileInput
