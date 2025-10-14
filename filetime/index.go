package filetime

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
	"tools/utils"
)



type Props struct {
	Dir string
}

func Main(props Props) {
	if props.Dir == "" {
		fmt.Println("未输入目录")
		return
	}

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
