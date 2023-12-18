'use strict'
var path = require('path')
var fs = require('fs')
var archiver = require('archiver')

const isForOnlineDemo = process.env.PACKAGE === 'demo'

var base = process.cwd() === __dirname ? '../' : ''
const pkg = require(path.join(__dirname, '/../package.json'))

var packageName = `${base}${isForOnlineDemo ? 'demo' : 'ace'}-v${pkg.version}`
var output = fs.createWriteStream(`${packageName}.zip`)
var _prefix = isForOnlineDemo ? '' : packageName

var archive = archiver('zip')

output.on('end', function () {
  console.log('Data has been drained')
})

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err
  }
})

// good practice to catch this error explicitly
archive.on('error', function (err) {
  throw err
})

archive.pipe(output)

var list = []

if (isForOnlineDemo) {
  list = [
    'app/browser/demo.min.js',
    'assets/image',
    'assets/favicon.png',
    'dist/**/**/*.min.js',    
    'dist/**/**/*.min.css',
    'dist/**/**/*.map',
    'html'
  ]
} else {
  list = [
    'assets',
    'build',
    'dist',
    'html',
    'js',
    'scss',
    'app',
    'views',

    'docs',

    'index.js',
    'package.json',
    'package-lock.json',
    'npm-shrinkwrap.json',
    '.gitignore',
    '.env',
    '.babelrc',
    '.browserslistrc',
    'changelog.md',
    'README.md' 
  ]
}

for (var item of list) {
  if (item.indexOf('*') >= 0) {
    archive.glob(`${base}${item}`, {}, {prefix: _prefix})
    continue
  }
  if (!fs.existsSync(`${base}${item}`)) continue

  if (fs.lstatSync(`${base}${item}`).isDirectory()) {
    archive.directory(`${base}${item}`, _prefix + '/' + item)
  } else {
    archive.file(`${base}${item}`, {name: item , prefix: _prefix})
  }
}



if (!isForOnlineDemo) {
  // add documentation files
  var extra = {
    'docs/assets/style.css' : '../ace-docs/assets/style.css',
    'docs/assets/favicon.png' : '../ace-docs/assets/favicon.png',
    'docs/assets/docs.js': '../ace-docs/assets/docs.js',
    'docs/assets/search.js': '../ace-docs/assets/search.js',
    'docs/assets/search-index.js': '../ace-docs/assets/search-index.js',
    'docs/images' : '../ace-docs/images'
  }

  for (var name in extra) {
    var item = extra[name];
    if (item.indexOf('*') >= 0) {
      archive.glob(`${base}${item}`, {}, {prefix: _prefix})
      continue
    }
    if (!fs.existsSync(`${base}${item}`)) continue

    if (fs.lstatSync(`${base}${item}`).isDirectory()) {
      archive.directory(`${base}${item}`,  _prefix + '/' + name)
    } else {
      archive.file(`${base}${item}`, { name: name , prefix: _prefix })
    }
  }

  // add required node_modules files
  try {
    var assetsList = fs.readFileSync('required-assets.txt')
    fs.unlinkSync('required-assets.txt')

    assetsList = JSON.parse(assetsList)

    assetsList.push('node_modules/@fortawesome/fontawesome-free/webfonts')
    assetsList.push('node_modules/jam-icons/fonts')
    assetsList.push('node_modules/eva-icons/style/fonts')
    assetsList.push('node_modules/photoswipe/dist/default-skin/default-skin.png')
    assetsList.push('node_modules/photoswipe/dist/default-skin/default-skin.svg')
    assetsList.push('node_modules/photoswipe/dist/default-skin/preloader.gif')

    //assets required for documentation
    assetsList.push('../ace-docs/node_modules/bootstrap/dist/css/bootstrap-reboot.css')
    assetsList.push('../ace-docs/node_modules/prism-themes/themes/prism-material-light.css')
    assetsList.push('../ace-docs/node_modules/prismjs/plugins/line-highlight/prism-line-highlight.css')
    assetsList.push('../ace-docs/node_modules/prismjs/prism.js')
    assetsList.push('../ace-docs/node_modules/prismjs/plugins/line-highlight/prism-line-highlight.js')
    assetsList.push('../ace-docs/node_modules/mark.js/dist/jquery.mark.js')
    assetsList.push('../ace-docs/node_modules/lunr/lunr.js')

    for (var item of assetsList) {
      if (!fs.existsSync(`${base}${item}`)) continue

      if (fs.lstatSync(`${base}${item}`).isFile()) {    
        archive.file(`${base}${item}`, { name: item.replace('../ace-docs/', '') , prefix: _prefix })
      }
      else {
        archive.directory(`${base}${item}`, _prefix + '/' + item)
      }
    }
  } 
  catch(e) {
    console.log(e)
  }

  archive.append("<html><head><meta charset='utf-8' /><meta http-equiv='refresh' content='0; url=./html/dashboard.html' /></head></html>", { name: 'index.html' , prefix: _prefix })

  // for documentation
  archive.append("<html><head><meta charset='utf-8' /><meta http-equiv='refresh' content='0; url=./docs/html/index.html' /></head></html>", { name: 'documentation.html' , prefix: _prefix })
  archive.append("<html><head><meta charset='utf-8' /><meta http-equiv='refresh' content='0; url=./html/index.html' /></head></html>", { name: 'docs/index.html' , prefix: _prefix })
}

else {
  archive.append("<html><head><meta charset='utf-8' /><meta http-equiv='refresh' content='0; url=./html/dashboard.html' /></head></html>", { name: 'index.html' , prefix: _prefix })
}



archive.finalize()
