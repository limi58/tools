import sharp from 'sharp'
import { statSync, copyFileSync } from 'fs'
import path from 'path'
import childProcess from 'child_process'
import util from 'util'
import { getFiles } from './get-files'
import { q, rl } from './service'

const exec = util.promisify(childProcess.exec)

const options = {
  maxWidth: 4000,
  imgDir: '',
  noHandleMinSize: 250,
  distFormat: 'HEIC',
  // kb and Q
  QMap: {
    0: 60,
    80: 55,
    500: 50,
  },
}

let currentDoneNum = 0
let filesLen = 0

main()

async function optimize() {
  const files = getFiles({ pathname: options.imgDir, deep: false })
  const now = Date.now()
  filesLen = files.length

  await createDirs({ imgPath: options.imgDir })

  for (const idx in files) {
    const imgPath = files[idx]
    const imgDir = path.dirname(imgPath)
    const imgExtname = path.extname(imgPath)
    const tmpImgPath = path.join(
      imgDir,
      'tmp',
      `debugmi-${now}-tmp-${idx}${imgExtname}`,
    )
    const distImgPath = path.join(
      imgDir,
      'dist',
      path.basename(imgPath, imgExtname) + `.${options.distFormat}`,
    )
    const distOriginImgPath = path.join(imgDir, 'dist', path.basename(imgPath))
    // KB
    const fileSize = statSync(imgPath).size / 1024
    // min kb skip handle
    if (fileSize <= options.noHandleMinSize) {
      copyFileSync(imgPath, distOriginImgPath)
      recordDone({ imgPath, distImgPath: distOriginImgPath })
      continue
    }
    const Q = getQ({ fileSize })

    const imgScale = await getImgScale({ imgPath })

    await exec(`vips resize ${imgPath} ${tmpImgPath} ${imgScale || 1}`)
      .then((res) => {
        return exec(`vips heifsave ${tmpImgPath} ${distImgPath} --Q=${Q}`)
      })
      .then((res) => {
        recordDone({ imgPath, distImgPath })
      })
      .catch((err) => {
        console.error(`exec error: ${err}`)
      })
  }
}

function recordDone(params: { imgPath: string; distImgPath: string }) {
  currentDoneNum++
  console.log(
    `${((currentDoneNum / filesLen) * 100).toFixed(2)}% ==== ${
      params.imgPath
    } => ${params.distImgPath}`,
  )
}

function getQ(params: { fileSize: number }) {
  let Q
  Object.keys(options.QMap)
    .reverse()
    .some((kb) => {
      if (params.fileSize >= +kb) {
        Q = options.QMap[kb]
        return true
      }
    })
  return Q
}

function createDirs(params: { imgPath: string }) {
  const distPath = path.join(params.imgPath, 'dist')
  const tmpPath = path.join(params.imgPath, 'tmp')
  return exec(`mkdir ${distPath} & mkdir ${tmpPath}`)
    .then(() => console.log('dir created'))
    .catch((err) => console.log('dir exists, skip create...'))
}

/**
 * get img scale width max width
 */
function getImgScale(params: { imgPath: string }) {
  const img = sharp(params.imgPath)
  return img
    .metadata()
    .then((res) => {
      return res.width > options.maxWidth ? options.maxWidth / res.width : false
    })
    .catch((err) => {
      console.log(err)
      return false
    })
}

async function main() {
  // /Volumes/limi_hd/pic/done
  const imgDir = await q('what is the img dir path')
  const maxWidth = +(await q(`max width (default ${options.maxWidth})`))
  const noHandleMinSize = +(await q(
    `less than what size(kb) can ignore (default ${options.noHandleMinSize})`,
  ))
  options.maxWidth = maxWidth || options.maxWidth
  options.imgDir = imgDir
  options.noHandleMinSize = noHandleMinSize || options.noHandleMinSize

  if (!options.maxWidth || !options.imgDir) {
    throw new Error('please must input these question')
  }

  console.log('======= please check ========')
  console.log(
    `image max width: ${options.maxWidth}\nimage base dir: ${options.imgDir}\nno handle size: ${options.noHandleMinSize}\n`,
  )
  console.log('===============')
  await q('please check the input, then press any key to continue...')
  optimize()
  rl.close()
}
