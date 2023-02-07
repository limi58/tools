interface GetFilesProps {
  /** 要查找的目录路径 */
  pathname: string
  /** 需要在递归中排除的文件夹或文件名，和 includeExp的 不能共存 */
  excludeExp?: RegExp
  /** 需要在递归中包含的文件夹或文件名，和 excludeExp 不能共存 */
  includeExp?: RegExp
  /** 是否递归获取，否则只查找第一层 */
  deep?: boolean
}

/**
 * 获取目标文件夹下的指定文件
 * 返回文件绝对路径列表
 * @example
 * const files = getFiles({
 *   pathname: path.resolve(process.cwd(), 'pages'),
 *   deep: true,
 *   excludeExp: /withdraw/,
 * })
 */
export function getFiles(props: GetFilesProps) {
  const files: Array<string> = []
  if ('excludeExp' in props && 'includeExp' in props) {
    throw new Error('can not both set excludeExp and includeExp')
  }
  getAllFilesInner(props)

  function getAllFilesInner(innerProps: GetFilesProps) {
    // all files and dirs
    const dirs = fs.readdirSync(innerProps.pathname)
    let filterDirs: string[] = []
    if ('excludeExp' in props) {
      filterDirs = dirs.filter((item) => !props.excludeExp?.test(item))
    } else if ('includeExp' in props) {
      filterDirs = dirs.filter((item) => props.includeExp?.test(item))
    } else {
      filterDirs = dirs
    }
    const realDirs = filterDirs.map((item) =>
      path.join(innerProps.pathname, item),
    )
    realDirs.forEach((item) => {
      if (fs.statSync(item).isDirectory()) {
        if (props.deep) {
          getAllFilesInner({
            ...innerProps,
            pathname: item,
          })
        }
      } else {
        files.push(item)
      }
    })
  }
  return files
}
