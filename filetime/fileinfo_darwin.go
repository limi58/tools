//go:build darwin

package filetime

import (
	"fmt"
	"os"
	"syscall"
	"time"
)

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

	ts := stat.Birthtimespec
	creationTime := time.Unix(ts.Sec, ts.Nsec)

	return creationTime.Format(time.DateOnly), nil
}
