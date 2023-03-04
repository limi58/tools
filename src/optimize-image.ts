import { statSync, copyFileSync } from 'fs'
import path from 'path'
import childProcess from 'child_process'
import util from 'util'
import { getFiles } from './get-files'
import { q, rl } from './service'

const exec = util.promisify(childProcess.exec)

const config = {
  imgDir: '',
  noHandleMinSize: 250,
  distFormat: 'HEIC',
  // kb and Q
  QMap: {
    '.jpg': 50,
    '.jpeg': 50,
    '.png': 40,
    '.heic': 40,
  },
}

let currentDoneNum = 0
let filesLen = 0

main()

async function optimize() {
  const files = getFiles({ pathname: config.imgDir, deep: false })
  const distDirPath = path.join(config.imgDir, 'optimize-dist')
  filesLen = files.length

  await createDirs(distDirPath)

  for (const idx in files) {
    const imgPath = files[idx]
    const imgExtname = path.extname(imgPath).toLowerCase()
    let distFilePath = path.join(distDirPath, path.basename(imgPath))
    if (imgExtname === '.png') {
      distFilePath = distFilePath.replace(/\.png/gi, '.heic')
    }
    const Q = getQ(imgExtname)

    // KB
    const fileSize = statSync(imgPath).size / 1024
    // min kb skip handle
    if (fileSize <= config.noHandleMinSize || Q == null) {
      copyFileSync(imgPath, distFilePath)
      recordDone({ imgPath, distImgPath: distFilePath })
      continue
    }

    switch (imgExtname) {
      case '.jpg':
      case '.jpeg':
        await exec(`vips jpegsave "${imgPath}" "${distFilePath}" --Q=${Q}`)
        break
      case '.heic':
        await exec(`vips heifsave "${imgPath}" "${distFilePath}" --Q=${Q}`)
        break
      case '.png':
        await exec(`vips heifsave "${imgPath}" "${distFilePath}" --Q=${Q}`)

      default:
        break
    }

    recordDone({ imgPath, distImgPath: distFilePath })
  }
}

function recordDone(params: { imgPath: string; distImgPath: string }) {
  currentDoneNum++
  const oldFileSize = (statSync(params.imgPath).size / 1024).toFixed(2)
  const newFileSize = (statSync(params.distImgPath).size / 1024).toFixed(2)
  const reducePercent = 100 - +((+newFileSize / +oldFileSize) * 100).toFixed(2)
  console.log(`${((currentDoneNum / filesLen) * 100).toFixed(2)}% done`)
  console.log(`${reducePercent}% reduce...${oldFileSize}kb to ${newFileSize}kb`)
  console.log(`${params.imgPath} => ${params.distImgPath}`)
}

function getQ(extname: string): number {
  return config.QMap[extname]
}

function createDirs(dirPath: string) {
  return exec(`mkdir -p ${dirPath}`)
    .then(() => console.log(`dir created: ${dirPath}`))
    .catch((err) => console.log(err))
}

async function main() {
  // /Volumes/limi_hd/pic/done
  const imgDir = await q('what is the img dir path')
  const noHandleMinSize = +(await q(
    `less than what size(kb) can ignore (default ${config.noHandleMinSize})`,
  ))
  config.imgDir = imgDir
  config.noHandleMinSize = noHandleMinSize || config.noHandleMinSize

  if (!config.imgDir) {
    throw new Error('please must input these question')
  }

  console.log('======= please check ========')
  console.log(
    `image base dir: ${config.imgDir}\nno handle size: ${config.noHandleMinSize}\n`,
  )
  console.log('===============')
  await q('please check the input, then press any key to continue...')
  optimize()
  rl.close()
}
