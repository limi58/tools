package heic

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

const TARGET_EXT = "heic"
const SKIP_KB = 250

var HANDLE_EXT = []string{"jpg", "jpeg", "png", "heic"}

func Main() {
	var dir string
	fmt.Print("图片文件夹 > ")
	fmt.Scanln(&dir)
	timeStart := time.Now()
	// 创建输出目录
	targetDir := filepath.Join(dir, TARGET_EXT)
	if _, err := os.Stat(targetDir); os.IsNotExist(err) {
		cmd := exec.Command("mkdir", targetDir)
		_, err := cmd.Output()
		utils.ExitIfErr(err)
		fmt.Println("输出目录不存在，已创建目录", targetDir)
	}
	err := utils.ForEachFiles(&utils.ForEachFilesCfg{
		Dir:         dir,
		IsRecursion: false,
		Cb:          func(file *utils.FileItem) error { return handleFile(file, targetDir) },
	})
	fmt.Println("---------------------")
	fmt.Println("done，花费毫秒：", time.Since(timeStart).Milliseconds())
	if err != nil {
		fmt.Println(err)
		return
	}
}

func getFileNameWithoutExt(path string) string {
	// 获取文件名（包含后缀）
	fileNameWithExt := filepath.Base(path)
	// 获取文件后缀，如 .png
	ext := filepath.Ext(fileNameWithExt)
	// 去除后缀
	fileName := strings.TrimSuffix(fileNameWithExt, ext)
	return fileName
}

func handleFile(file *utils.FileItem, targetDir string) error {
	fileName := file.Info.Name()
	ext := filepath.Ext(file.Info.Name())
	ext = lo.Substring(ext, 1, uint(utf8.RuneCountInString(ext)))
	ext = strings.ToLower(ext)

	// 过滤文件，只允许图片被处理
	if !lo.Contains(HANDLE_EXT, ext) {
		fmt.Println("no allow ext file:", fileName)
		return nil
	}

	// 图片太小，直接跳过
	if file.Info.Size()/1000 <= SKIP_KB {
		fmt.Println("图片太小，直接跳过", fileName)
		return nil
	}

	// 开始处理
	go func() {
		targetFilePath := filepath.Join(targetDir, getFileNameWithoutExt(file.Path)+"."+TARGET_EXT)
		cmd := exec.Command("vips", "heifsave", file.Path, targetFilePath, "--Q=50", "--effort=9")

		_, err := cmd.Output()

		if err != nil {
			fmt.Println(err)
		}

		fmt.Println("已完成", fileName)

	}()

	return nil
}
