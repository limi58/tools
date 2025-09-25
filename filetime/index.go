package filetime

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"syscall"
	"time"
	"tools/utils"
)

// 获取文件创建时间，兼容多个操作系统
func getFileCt(filePath string) (string, error) {
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return "", fmt.Errorf("获取文件信息失败: %w", err)
	}

	// 从 FileInfo 中获取底层的系统特定信息
	sysStat := fileInfo.Sys()
	if sysStat == nil {
		// 这种情况理论上不应该在 Linux/macOS 上发生，但作为健壮性检查
		return "", fmt.Errorf("无法获取系统特定文件信息")
	}

	// 将其类型断言为 *syscall.Stat_t
	stat, ok := sysStat.(*syscall.Stat_t)
	if !ok {
		return "", fmt.Errorf("系统文件信息类型断言失败")
	}

	var creationTime time.Time
	// 根据操作系统选择时间戳
	switch runtime.GOOS {
	case "darwin": // macOS
		// macOS 提供 Birthtimespec，如果在 macOS 上编译就取消注释下面
		ts := stat.Birthtimespec
		creationTime = time.Unix(ts.Sec, ts.Nsec)
	case "linux":
		// !! 这不是真正的创建时间！ Linux 标准 stat 不提供 Birthtime，回退到 Ctim (状态更改时间)
		// ts := stat.Ctim
		// creationTime = time.Unix(ts.Sec, ts.Nsec)
	default:
		return "", fmt.Errorf("当前操作系统 (%s) 不支持此方法获取创建时间", runtime.GOOS)
	}

	return creationTime.Format(time.DateOnly), nil
}

type Props struct {
	Dir string
}

func Main(props Props) {
	utils.ForEachFiles(&utils.ForEachFilesCfg{
		Dir:         props.Dir,
		IsRecursion: false,
		Cb: func(file *utils.FileItem) error {
			timeStr, err := getFileCt(file.Path)
			if err != nil {
				return nil
			}
			newFileName := fmt.Sprintf("%s-%s", timeStr, utils.GetRanStr(4)) + filepath.Ext(file.Path)
			newFilePath := filepath.Join(props.Dir, newFileName)
			err = os.Rename(file.Path, newFilePath)
			if err != nil {
				fmt.Println(err)
			}
			fmt.Printf("✅ 已完成 %s -> %s \n", file.Info.Name(), newFileName)
			time.Sleep(1 * time.Second)
			return nil
		},
	})

}
