package webp

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"tools/utils"
)

const ext = "webp"
const skipKb = 2

func Main() {
	var dir string
	fmt.Print("图片文件夹 > ")
	fmt.Scanln(&dir)
	timeStart := time.Now()
	// 创建输出目录
	targetDir := filepath.Join(dir, ext)
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
	// 获取文件后缀
	ext := filepath.Ext(fileNameWithExt)
	// 去除后缀
	fileName := strings.TrimSuffix(fileNameWithExt, ext)
	return fileName
}

func handleFile(file *utils.FileItem, targetDir string) error {
	fileName := file.Info.Name()

	// 图片太小，直接跳过
	if file.Info.Size()/1000 <= skipKb {
		fmt.Println("图片太小，直接跳过", fileName)
		return nil
	}

	// 开始处理
	targetFilePath := filepath.Join(targetDir, getFileNameWithoutExt(file.Path)+"."+ext)
	cmd := exec.Command("vips", "webpsave", file.Path, targetFilePath, "--Q=80", "--effort=6")

	_, err := cmd.Output()

	if err != nil {
		fmt.Println(err)
	}

	fmt.Println("已完成", fileName)

	return nil
}
