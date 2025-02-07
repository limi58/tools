package img

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
	"unicode/utf8"

	"tools/utils"

	"github.com/samber/lo"
)

type cfgMapItem struct {
	targetExt string
	skipKb    int
	handleExt []string
}

var cfgMap = map[string]cfgMapItem{
	"heic": {
		targetExt: "heic",
		skipKb:    250,
		handleExt: []string{"jpg", "jpeg", "png", "heic"},
	},
	"webp": {
		targetExt: "webp",
		skipKb:    2,
		handleExt: []string{"jpg", "jpeg", "png", "webp"},
	},
}

var cfgItem cfgMapItem

func Main(ext string) {
	var dir string
	fmt.Print("图片文件夹 > ")
	fmt.Scanln(&dir)
	timeStart := time.Now()
	cfgItem = cfgMap[ext]
	// 创建输出目录
	targetDir := filepath.Join(dir, cfgItem.targetExt)
	if _, err := os.Stat(targetDir); os.IsNotExist(err) {
		cmd := exec.Command("mkdir", targetDir)
		_, err := cmd.Output()
		utils.ExitIfErr(err)
		fmt.Println("输出目录不存在，已创建目录", targetDir)
	}
	err := utils.ForEachFiles(&utils.ForEachFilesCfg{
		Dir:         dir,
		IsRecursion: false,
		Cb: func(file *utils.FileItem) error {
			return handleFile(file, targetDir)
		},
	})
	fmt.Println("---------------------")
	timeS := fmt.Sprintf("%.1f", float64(time.Since(timeStart).Milliseconds()/1000))
	fmt.Println("done， 耗时（s)：", timeS)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func handleFile(file *utils.FileItem, targetDir string) error {
	fileName := file.Info.Name()
	ext := filepath.Ext(file.Info.Name())
	ext = lo.Substring(ext, 1, uint(utf8.RuneCountInString(ext)))
	ext = strings.ToLower(ext)

	// 过滤文件，只允许图片被处理
	if !lo.Contains(cfgItem.handleExt, ext) {
		fmt.Println("no allow ext file:", fileName)
		return nil
	}

	// 图片太小，直接跳过
	if file.Info.Size()/1000 <= int64(cfgItem.skipKb) {
		fmt.Println("图片太小，直接跳过", fileName)
		return nil
	}

	// 开始处理
	fmt.Println("处理中", fileName)
	targetFilePath := filepath.Join(targetDir, utils.GetFileNameWithoutExt(file.Path)+"."+cfgItem.targetExt)

	var cmd *exec.Cmd

	switch cfgItem.targetExt {
	case "heic":
		cmd = exec.Command("vips", "heifsave", file.Path, targetFilePath, "--Q=50", "--effort=9")

	case "webp":
		cmd = exec.Command("vips", "webpsave", file.Path, targetFilePath, "--Q=80", "--effort=6")
	}

	_, err := cmd.Output()

	if err != nil {
		fmt.Println(err)
	}

	fmt.Println("✅ 已完成", fileName)

	return nil
}
