package img

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"

	"tools/utils"

	"github.com/samber/lo"
	"golang.org/x/sync/semaphore"
)

var cpuNum = runtime.NumCPU()

type cfgMapItem struct {
	targetExt      string
	skipKb         int
	handleExt      []string
	concurrencyNum int
	quality        string
}

var cfgMap = map[string]cfgMapItem{
	"heic": {
		targetExt:      "heic",
		skipKb:         250,
		handleExt:      []string{"jpg", "jpeg", "png", "heic"},
		concurrencyNum: cpuNum,
		quality:        "50",
	},
	"webp": {
		targetExt:      "webp",
		skipKb:         2,
		handleExt:      []string{"jpg", "jpeg", "png", "webp"},
		concurrencyNum: cpuNum,
		quality:        "80",
	},
}

var cfgItem cfgMapItem
var lock = sync.Mutex{}
var doneNum = 0
var quality string

func Main(imgType string) {
	cfgItem = cfgMap[imgType]
	var dir string
	fmt.Print("图片文件夹 > ")
	fmt.Scanln(&dir)
	fmt.Printf("输出质量（默认%s）> ", cfgItem.quality)
	fmt.Scanln(&quality)
	if quality == "" {
		quality = cfgItem.quality
	}
	timeStart := time.Now()
	// 创建输出目录
	targetDir := filepath.Join(dir, cfgItem.targetExt)
	if _, err := os.Stat(targetDir); os.IsNotExist(err) {
		err := os.MkdirAll(targetDir, 0755)
		utils.ExitIfErr(err)
		fmt.Println("输出目录不存在，已创建目录", targetDir)
	}
	fileList := make([]*utils.FileItem, 0, 10)
	err := utils.ForEachFiles(&utils.ForEachFilesCfg{
		Dir:         dir,
		IsRecursion: false,
		Cb: func(file *utils.FileItem) error {
			fileName := file.Info.Name()
			// 这里获取的是带.的
			ext := filepath.Ext(file.Info.Name())
			ext = strings.ToLower(ext[1:])
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
			fileList = append(fileList, file)
			return nil
		},
	})
	fileListLen := len(fileList)
	if fileListLen == 0 {
		fmt.Println("没有需要处理的文件")
		return
	}
	// 使用 semaphore 控制并发数
	sem := semaphore.NewWeighted(int64(cfgItem.concurrencyNum))
	var wg sync.WaitGroup
	ctx := context.TODO()
	for _, fileItem := range fileList {
		wg.Add(1)
		go func(file *utils.FileItem) {
			defer wg.Done()
			if err := sem.Acquire(ctx, 1); err != nil {
				fmt.Println("获取信号量失败:", err)
				return
			}
			defer sem.Release(1)
			handleFile(fileItem, targetDir, fileList)
		}(fileItem)
	}
	wg.Wait()
	fmt.Println("---------------------")
	timeS := fmt.Sprintf("%.1f", float64(time.Since(timeStart).Milliseconds())/1000)
	fmt.Println("done， 耗时：", timeS, "s")
	if err != nil {
		fmt.Println(err)
		return
	}
}

func addDoneNum() {
	lock.Lock()
	doneNum++
	lock.Unlock()
}

func handleFile(file *utils.FileItem, targetDir string, fileList []*utils.FileItem) error {
	fileName := file.Info.Name()
	// 开始处理
	fmt.Println("处理中", fileName)
	targetFilePath := filepath.Join(targetDir, utils.GetFileNameWithoutExt(file.Path)+"."+cfgItem.targetExt)
	var cmd *exec.Cmd
	switch cfgItem.targetExt {
	case "heic":
		cmd = exec.Command("vips", "heifsave", file.Path, targetFilePath, fmt.Sprintf("--Q=%s", quality), "--effort=9")
	case "webp":
		cmd = exec.Command("vips", "webpsave", file.Path, targetFilePath, fmt.Sprintf("--Q=%s", quality), "--effort=6")
	}
	b, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Println(err)
		fmt.Println(string(b))
	}
	addDoneNum()
	fmt.Printf("✅ 已完成 %d/%d %s \n", doneNum, len(fileList), fileName)
	return nil
}
