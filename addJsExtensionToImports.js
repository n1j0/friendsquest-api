// eslint-disable-next-line import/no-extraneous-dependencies
import * as fs from 'node:fs'
// eslint-disable-next-line import/no-extraneous-dependencies
import glob from 'glob'

glob('.out/**/*.js', {}, (error, files) => {
    if (error) {
        console.error('Error:', error)
    } else {
        files.forEach((filepath) => {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.readFile(filepath, 'utf8', (error_, data) => {
                if (!/import .* from/g.test(data)) {
                    return
                }
                // replace all imports starting with ".."
                let newData = data.replace(/(import .* from\s+["']\.\..*(?=["']))/g, '$1.js')
                // replace all imports starting with "."
                newData = newData.replace(/(import .* from\s+["']\..*(?=["']))/g, '$1.js')
                // replace duplicated ".js.js" with ".js"
                newData = newData.replace(/(.js){2}/g, '.js')
                if (error_) {
                    throw error_
                }
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                fs.writeFile(filepath, newData, (error__) => {
                    if (error__) {
                        throw error__
                    }
                })
            })
        })
    }
})
