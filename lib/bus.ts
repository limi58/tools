import childProcess from 'child_process'
import chalk from 'chalk'
import fs from 'fs'
import readline from 'readline'
import getFiles from './get_files'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

main()

function main() {
  const action = process.argv[2]
  switch (action) {
    case 'to-mac':
      to('mac')
      break
    case 'to-phone':
      to('phone')
      break
    default:
      logInfo('use to-mac, to-phone')
      break
  }
}

function to(type: 'mac' | 'phone') {
  try {
    fs.accessSync('/Volumes/limi_hd')
  } catch (err) {
    logErr('hd no ready')
    return
  }
  const dateIst = new Date()
  const year = dateIst.getFullYear()
  const month = dateIst.getMonth()
  const date = dateIst.getDate()
  if (type === 'mac') {
    rl.question(
      '==== please check u0_a140@mi:~/storage/shared/DCIM ====, and press enter...',
      () => {
        rl.close()
        logInfo('sending...')
        const now = Date.now()
        childProcess
          .execSync(
            `rsync -ravz --progress --exclude=".*" u0_a140@mi:~/storage/shared/DCIM /Volumes/limi_hd/phone${year}${month}${date}`,
            { stdio: 'inherit' },
          )
          .toString()
        // 构建结束
        logInfo(`send done, ${(Date.now() - now) / 1000}s`)
      },
    )
  }
  if (type === 'phone') {
    const macFiles = getFiles({
      pathname: '/Volumes/limi_hd/to-phone',
      deep: true,
    })
    console.log(macFiles.slice(0, 20))
    console.log('... and more ...')
    console.log(`total ${macFiles.length} files`)
    rl.question(
      '==== please check /Volumes/limi_hd/to_phone ====, and press enter...',
      () => {
        rl.close()
        logInfo('sending...')
        const now = Date.now()

        childProcess.execSync(
          `rsync -ravz --progress --exclude=".*" /Volumes/limi_hd/to-phone u0_a140@mi:~/storage/shared/DCIM/temp`,
          { stdio: 'inherit' },
        )
        // 构建结束
        logInfo(`send done, ${(Date.now() - now) / 1000}s`)
      },
    )
  }
}

function logErr(str: string) {
  console.log('\n')
  console.log(chalk.bgRed.white(str))
  console.log('\n')
}

function logInfo(str: string) {
  console.log('\n')
  console.log(chalk.greenBright(str))
  console.log('\n')
}
