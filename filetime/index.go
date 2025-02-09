package filetime

import (
	"fmt"
	"os"
	"path/filepath"
	"syscall"
	"time"
	"tools/utils"
)

func getFileCt(filePath string) string {
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		utils.ExitIfErr(err)
	}

	stat := fileInfo.Sys().(*syscall.Stat_t)
	createTime := time.Unix(int64(stat.Ctim.Sec), int64(stat.Ctim.Nsec))

	return createTime.Format(time.DateOnly)
}

func Main() {
	var dir string
	fmt.Print("要处理的文件夹 > ")
	fmt.Scanln(&dir)

	utils.ForEachFiles(&utils.ForEachFilesCfg{
		Dir:         dir,
		IsRecursion: false,
		Cb: func(file *utils.FileItem) error {
			timeStr := getFileCt(file.Path)
			newFileName := fmt.Sprintf("%s-%s", timeStr, utils.GetRanStr(4)) + filepath.Ext(file.Path)
			newFilePath := filepath.Join(dir, newFileName)
			err := os.Rename(file.Path, newFilePath)
			if err != nil {
				fmt.Println(err)
			}
			fmt.Printf("✅ 已完成 %s -> %s \n", file.Info.Name(), newFileName)
			time.Sleep(1 * time.Second)
			return nil
		},
	})

}
