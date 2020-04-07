import path from 'path'
import fs from 'fs'


interface IProps{
  pathname: string, // 目录路径
  excludeExp?: RegExp, // 需要在递归中排除的文件夹或文件名
  filterExp?: RegExp, // 得到文件列表后，进一步筛选出的文件或文件夹名称
  deep?: boolean, // 是否递归获取
}


/**
 * 获取目标文件夹下的指定文件，支持深层查找
 */
function getFiles(props: IProps) {
  const files: Array<string> = []
  const filterExp = props.filterExp
  getAllFilesInner(props)

  function getAllFilesInner(innerProps: IProps) {
    const excludeExp = innerProps.excludeExp
    const pathname = innerProps.pathname
    const dirs = fs.readdirSync(pathname)
    const filterDirs = dirs.filter(item => {
      if (!excludeExp) {
        return true
      }
      return !excludeExp.test(item) 
    })
    const realDirs = filterDirs.map(item => path.join(pathname, item))
    realDirs.forEach(item => {
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
  return files.filter(item => filterExp.test(item))
}

export default getFiles
