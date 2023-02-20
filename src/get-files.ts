import path from 'path'
import fs from 'fs'

interface IProps {
  pathname: string // 目录路径
  excludeExp?: RegExp // 需要在递归中排除的文件夹或文件名
  includeExp?: RegExp // 需要在递归中包含的文件夹或文件名
  filterExp?: RegExp // 得到文件列表后，进一步筛选出的文件或文件夹名称
  deep?: boolean // 是否递归获取
}

function checkProps(props: IProps) {
  if (props.excludeExp && props.includeExp) {
    throw new Error('Do not use excludeExp and includeExp at the same time !!!')
  }
}

/**
 * 获取目标文件夹下的指定文件
 * 返回文件绝对路径列表
 */
export function getFiles(props: IProps) {
  checkProps(props)
  const files: Array<string> = []
  const filterExp = props.filterExp
  getAllFilesInner(props)

  function getAllFilesInner(innerProps: IProps) {
    const excludeExp = innerProps.excludeExp
    const includeExp = innerProps.includeExp
    const pathname = innerProps.pathname
    const dirs = fs.readdirSync(pathname)
    const filterDirs = dirs.filter((item) => {
      if (excludeExp) {
        return !excludeExp.test(item)
      }
      if (includeExp) {
        return includeExp.test(item)
      }
      return true
    })
    const realDirs = filterDirs.map((item) => path.join(pathname, item))
    realDirs.forEach((item) => {
      if (fs.statSync(item).isDirectory()) {
        if (innerProps.deep) {
          getAllFilesInner({
            excludeExp: innerProps.excludeExp,
            pathname: item,
          })
        }
      } else {
        files.push(item)
      }
    })
  }
  if (!filterExp) {
    return files
  }
  return files.filter((item) => filterExp.test(item))
}
