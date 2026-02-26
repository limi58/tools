//go:build windows

package filetime

import (
	"fmt"
	"os"
	"syscall"
	"time"
)

const windowsEpochBiasIn100ns = 116444736000000000

func filetimeToUnixNano(ft syscall.Filetime) int64 {
	ticks := (uint64(ft.HighDateTime) << 32) | uint64(ft.LowDateTime)
	if ticks < windowsEpochBiasIn100ns {
		return 0
	}
	return int64((ticks - windowsEpochBiasIn100ns) * 100)
}

func getFileCt(filePath string) (string, error) {
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return "", fmt.Errorf("获取文件信息失败: %w", err)
	}

	sysStat := fileInfo.Sys()
	if sysStat == nil {
		return "", fmt.Errorf("无法获取系统特定文件信息")
	}

	stat, ok := sysStat.(*syscall.Win32FileAttributeData)
	if !ok {
		return "", fmt.Errorf("系统文件信息类型断言失败")
	}

	creationTime := time.Unix(0, filetimeToUnixNano(stat.CreationTime))
	return creationTime.Format(time.DateOnly), nil
}
