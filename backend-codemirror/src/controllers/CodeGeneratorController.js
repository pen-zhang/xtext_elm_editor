// FILE: <project>/backend/src/controllers/CodeGeneratorController.js
'use strict'

const config = require('../config')
const fsPromises = require('fs').promises
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
// const uuidv4 = require('uuid').v4 // random UUID

module.exports = {
  async compileToElm (req, res) {
    /*
     * We prepare a temporary directory to use it as our working directory.
     * The name of this directory will be a automatic generated UUID.
     * The directory will be deleted after we've send the compiled code to the user.
     * It is very unlikely that the directory names will collide.
     */
    try {
      // if (!req.body.code) throw new Error('No code provided')

      // move dsl code to elm project src folder
      const elmWorkerDir = path.join(
        path.dirname(config.paths.dslCompiler),
        'elm-worker/'
      )
      const destDir = path.join(elmWorkerDir, 'elm-compile/src/Shapes.elm')
      const content = await fsPromises.readFile(destDir, 'utf-8')
      const insertPos = content.indexOf('insert here') + 11
      await fsPromises.truncate(destDir, insertPos)

      let filehandle
      try {
        filehandle = await fsPromises.open(destDir, 'a').then((fh) => {
          return fh.write('\r\n' + req.body.code, insertPos, 'utf-8')
        }).then((written) => {
          console.log(written.bytesWritten + ' characters added to file...')
        }).catch((err) => {
          console.log(err)
        })
      } finally {
        if (filehandle !== undefined) {
          await filehandle.close()
        }
      }
      console.log('generate elm code done... start to compile elm code')

      // compile elm file
      try {
        execSync('elm make --report=json src/Main.elm', {
          cwd: `${elmWorkerDir}elm-compile`
        })
        console.log('Compile elm done...')

        // read the generated html file ...
        const generatedHtml = await fsPromises.readFile(
          `${elmWorkerDir}elm-compile/index.html`,
          'UTF-8'
        )

        // ... and send it back to the user
        await res.send({
          code: generatedHtml
        })
      } catch (err) {
        console.log('\r\n%cCompile Error...', 'color:red;background:yellow;')
        console.error('Error code: ' + err.status)

        const errMessage = err.stderr.toString()

        fs.readFile(`${elmWorkerDir}error-message/errors.html`, (err, data) => {
          if (err) throw err
          res.set('Content-Type', 'text/html')
          // console.log(data.toString())

          data = data.toString()
          const i = data.indexOf('<body>') + 6

          const s = `<script>
            var app = Elm.Errors.init({flags: ${errMessage}});
            app.ports.jumpTo.subscribe(function(region) {window.parent.postMessage(JSON.stringify(region), '*');});
            </script>`

          const errData = data.slice(0, i) + s + data.slice(i)
          // console.error(errData)
          res.send({
            code: errData
          })
        })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: err
      })
    }
  }
}
