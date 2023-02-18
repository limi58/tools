// npx ts-node ./src/add_date.ts --path=/Volumes/limi_hd/pic/2020/test
// --path=xxx 需要处理的文件目录
// --deep=true 递归处理
import { getFiles } from './get_files'
import fs from 'fs'
// import yargs from 'yargs'
import dayjs from 'dayjs'
import path from 'path'
import exif from 'exif'
import { q, rl } from './service'

const ExifImage = exif.ExifImage

let MAX_YEAR
let USE_YEAR

main()

async function addDate(inputPath: string) {
  const files = getFiles({
    pathname: inputPath,
    deep: false,
  })
  // const files = getFiles({ pathname: inputPath, deep: false, includeExp: /\.jpeg$/ })
  let currentFinishCount = 0
  const totalFileCount = files.length
  files.forEach(async (file, fileIdx) => {
    // getImageInfo(file)
    // console.log(await getImageInfo(file))
    // return
    const dateFileName = await getImageFileName(file, fileIdx)
    // console.log(dateFileName)
    fs.access(dateFileName, fs.constants.F_OK, (err) => {
      if (err) {
        fs.rename(file, dateFileName, () => {
          currentFinishCount++
          console.log(
            file,
            dateFileName,
            `${currentFinishCount} / ${totalFileCount}`,
          )
        })
      } else {
        console.log(`exists file ${dateFileName}`)
      }
    })
  })
}

// async function getImageInfo(fileUrl: string) {
//   const fileInfo = fs.statSync(fileUrl)
//   const sharpInfo = await sharp(fileUrl).metadata()

//   let fileDate: string | number =
//     fileInfo.birthtimeMs || new Date('2013-01-01').getTime()
//   try {
//     if (sharpInfo.icc) {
//       fileDate = exifRender(sharpInfo.icc).ProfileDateTime
//     }
//     if (sharpInfo.exif) {
//       fileDate =
//         exifRender(sharpInfo.exif).DateTimeOriginal ||
//         exifRender(sharpInfo.exif).ModifyDate
//       fileDate = String(fileDate).split(' ')?.[0]?.replace(/:/g, '-')
//     }
//   } catch (error) {}

//   const fileTs = dayjs(fileDate).valueOf()

//   const imageInfo = {
//     size: fileInfo.size.toFixed(1),
//     width: sharpInfo.width,
//     fileTs,
//   }

//   return imageInfo
// }

/**
 * get file name by file create time + fileIdx
 * like: /User/2020-01-22-4M.jpg
 * @param fileUrl
 * @param fileIdx
 */
function getImageFileName(fileUrl: string, fileIdx: number) {
  return new Promise<string>((resolve, reject) => {
    // if filename has date info
    const dateRegs = [/20\d{6}/, /20\d{2}-\d{2}-\d{2}/]
    const reg = dateRegs.find((reg) => fileUrl.match(reg))
    if (reg) {
      const dateStr = fileUrl.match(reg)
      const ms = dayjs(dateStr[0]).valueOf()
      const uniqueFileName = getUniqueFileName({ originMs: ms, fileIdx })
      resolve(uniqueFileName)
      return
    }

    // read file date by exif
    new ExifImage({ image: fileUrl }, (error, exifData) => {
      let originDate: number | string = ''
      if (error) {
        originDate = +fs.statSync(fileUrl).birthtimeMs
      } else {
        const exifDateInfo =
          exifData?.exif?.DateTimeOriginal || exifData?.exif?.ModifyDate
        if (!exifDateInfo) {
          originDate = +fs.statSync(fileUrl).birthtimeMs
        } else {
          originDate = exifDateInfo.split(' ')?.[0]?.replace(/:/g, '-')
        }
      }
      // console.log(originDate,typeof originDate,5)
      const uniqueFileName = getUniqueFileName({
        originMs: originDate,
        fileIdx,
      })
      resolve(uniqueFileName)
    })
  })

  function getUniqueFileName(params: {
    originMs: number | string
    fileIdx: number
  }) {
    let dayjsIst = dayjs(params.originMs)
    if (dayjsIst.year() >= MAX_YEAR) {
      dayjsIst = dayjsIst.year(USE_YEAR)
    }
    const uniqueFileName = `${dayjsIst.format(
      'YYYY-MM-DD',
    )}-${params.fileIdx.toString(36)}`
    const fullFileName = path.join(
      path.dirname(fileUrl),
      `${uniqueFileName}${path.extname(fileUrl)}`,
    )
    return fullFileName
  }
}

async function main() {
  // /Volumes/limi_hd/pic/2030
  // addDate('/Volumes/limi_hd/pic/done')
  // addDate('/Users/limi/temp')
  const maxYear = +(await q('max year'))
  const useYear = +(await q('use year'))
  const picPath = await q('write the pic path')
  MAX_YEAR = maxYear
  USE_YEAR = useYear
  console.log('===============')
  console.log(
    `pic path: ${picPath}\nmax year: ${MAX_YEAR}\nuse year: ${USE_YEAR}\n`,
  )
  console.log('===============')
  await q('please check the input, then press any key to continue...')
  addDate(picPath)
  rl.close()
}
