import { getFiles } from './get-files'
import fs from 'fs'
import dayjs from 'dayjs'
import path from 'path'
// import exif from 'exif'
import { q, rl } from './service'

// const ExifImage = exif.ExifImage

// let MAX_YEAR = 3000
// let USE_YEAR = 3000

main()

async function addDate(inputPath: string) {
  const files = getFiles({
    pathname: inputPath,
    deep: false,
  })
  let currentFinishCount = 0
  const totalFileCount = files.length
  files.forEach(async (file, fileIdx) => {
    const dateFileName = await getImageFileName(file, fileIdx)
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

/**
 * try to get the file create time
 * get file name by file create time + fileIdx
 * return like: /User/2020-01-22-4M.jpg
 */
function getImageFileName(fileUrl: string, fileIdx: number) {
  return new Promise<string>((resolve, reject) => {
    // try to parse date from file name
    const dateRegs = [/20\d{6}/, /20\d{2}-\d{2}-\d{2}/]
    const reg = dateRegs.find((reg) => fileUrl.match(reg))
    if (reg) {
      const dateStr = fileUrl.match(reg)
      const ms = dayjs(dateStr[0]).valueOf()
      const uniqueFileName = getUniqueFileName({ originMs: ms, fileIdx })
      resolve(uniqueFileName)
      return
    }

    // on ubuntu, this way is more useful then the below exif way
    // on mac, seem exif way are useful, wait to verify...
    let originDate: number | string = ''
    const fileStat = fs.statSync(fileUrl)
    const fileStatTimes = [
      fileStat.atimeMs,
      fileStat.mtimeMs,
      fileStat.ctimeMs,
      fileStat.birthtimeMs,
    ].filter((item) => item > 0)
    originDate = +Math.min(...fileStatTimes)
    const uniqueFileName = getUniqueFileName({ originMs: originDate, fileIdx })
    resolve(uniqueFileName)

    // try to parse date from exif
    // new ExifImage({ image: fileUrl }, (error, exifData) => {
    //   let originDate: number | string = ''
    //   // if no exif, try to get least time of file stat
    //   if (error) {
    //     const fileStat = fs.statSync(fileUrl)
    //     const fileStatTimes = [
    //       fileStat.atimeMs,
    //       fileStat.mtimeMs,
    //       fileStat.ctimeMs,
    //       fileStat.birthtimeMs,
    //     ].filter((item) => item > 0)
    //     originDate = +Math.min(...fileStatTimes)
    //     console.log(originDate, fileUrl, 123)
    //   } else {
    //     const exifDateInfo =
    //       exifData?.exif?.DateTimeOriginal || exifData?.exif?.ModifyDate
    //     if (!exifDateInfo) {
    //       originDate = +fs.statSync(fileUrl).birthtimeMs
    //     } else {
    //       originDate = exifDateInfo.split(' ')?.[0]?.replace(/:/g, '-')
    //     }
    //   }
    //   const uniqueFileName = getUniqueFileName({
    //     originMs: originDate,
    //     fileIdx,
    //   })
    //   resolve(uniqueFileName)
    // })
  })

  function getUniqueFileName(params: {
    originMs: number | string
    fileIdx: number
  }) {
    let dayjsIst = dayjs(params.originMs)
    // if (dayjsIst.year() >= MAX_YEAR) {
    //   dayjsIst = dayjsIst.year(USE_YEAR)
    // }
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

const verify = (params: { picPath: string }) => {
  if (!params.picPath.trim()) {
    return {
      status: false,
      msg: 'dir path empty',
    }
  }
  return {
    status: true,
  }
}

async function main() {
  // /Volumes/limi_hd/pic/2030
  // addDate('/Volumes/limi_hd/pic/done')
  // addDate('/Users/limi/temp')
  const picPath = await q('where is files dir path, like: /User/pic')
  // const maxYear = +(await q('max year'))
  // const useYear = +(await q('use year'))
  // MAX_YEAR = maxYear
  // USE_YEAR = useYear
  const verifyRes = verify({ picPath })
  if (!verifyRes.status) {
    console.log(verifyRes.msg)
    rl.close()
    return
  }
  console.log('==== please check ====')
  // console.log(
  //   `files dir path: ${picPath}\nmax year: ${MAX_YEAR}\nuse year: ${USE_YEAR}\n`,
  // )
  console.log(`files dir path: ${picPath}\n`)
  console.log('======================')
  await q(
    'please check the above info, and backup your files, then press enter to continue...',
  )
  addDate(picPath)
  rl.close()
}
