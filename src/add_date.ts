// npx ts-node ./src/add_date.ts --path=/Volumes/limi_hd/pic/2020/test
// --deep=true 递归处理
import getFiles from './get_files'
import fs from 'fs'
import yargs from 'yargs'
import moment from 'moment'
import path from 'path'
import Chance from 'chance'
const chance = new Chance()


const query = yargs.options({
  path: { type: 'string' },
  deep: { type: 'boolean', default: false },
}).argv

main(5)

function addDate() {
  const files = getFiles({ pathname: query.path, deep: !!query.deep })
  let currentFinishCount = 0
  const totalFileCount = files.length
  files.forEach((file, fileIdx) => {
    const stat = fs.statSync(file)
    const time = moment(stat.birthtimeMs).format('YYYY-MM-DD') + `-${chance.string({ length: 4, alpha: true, numeric: true })}`
    const retFilename = path.join(path.dirname(file), `${time}${path.extname(file)}`)
    // console.log(retFilename)
    fs.access(retFilename, fs.constants.F_OK, (err) => {
      if (err) {
        fs.rename(file, retFilename, () => {
          currentFinishCount++
          console.log(`${currentFinishCount} / ${totalFileCount}`)
        })
      } else {
        console.log(`exists file ${retFilename}`)
      }
    })
  })
}

function main(initCount = 5) {
  setTimeout(() => {
    console.log(`countdown ${initCount}`)
    if (initCount < 1) {
      addDate()
    } else {
      main(initCount - 1)
    }
  }, 1000) 
}
