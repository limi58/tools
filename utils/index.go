package utils

import (
	"fmt"
	"os"
	"path/filepath"
)

type FileItem struct {
	Path string
	Info os.FileInfo
}

type ForEachFilesCfg struct {
	// 文件夹
	Dir string
	// 是否递归目录
	IsRecursion bool
	// 回调
	Cb func(file *FileItem) error
}

func ForEachFiles(cfg *ForEachFilesCfg) error {
	if cfg == nil {
		return fmt.Errorf("配置不能为空")
	}

	if cfg.Dir == "" {
		return fmt.Errorf("目录不能为空")
	}

	// 检查目录是否存在
	if _, err := os.Stat(cfg.Dir); os.IsNotExist(err) {
		return fmt.Errorf("目录 %s 不存在", cfg.Dir)
	}

	var walkFunc filepath.WalkFunc

	// 若递归
	if cfg.IsRecursion {
		walkFunc = func(path string, info os.FileInfo, err error) error {
			if err != nil {
				fmt.Printf("访问路径 %s 时发生错误: %v\n", path, err)
				return nil // 或 return err 如果你想在遇到错误时立即停止
			}

			// 排除目录本身，只处理文件
			if !info.IsDir() {
				if cfg.Cb != nil {
					if err := cfg.Cb(&FileItem{Path: path, Info: info}); err != nil {
						return fmt.Errorf("回调函数执行错误: %w", err)
					}
				}
			}

			return nil
		}
	} else {
		walkFunc = func(path string, info os.FileInfo, err error) error {
			if err != nil {
				fmt.Printf("访问路径 %s 时发生错误: %v\n", path, err)
				return nil // 或 return err 如果你想在遇到错误时立即停止
			}

			// 只处理当前目录下的文件，不递归子目录，Dir 返回元素的所在目录
			if filepath.Dir(path) == cfg.Dir && !info.IsDir() {
				if cfg.Cb != nil {
					if err := cfg.Cb(&FileItem{Path: path, Info: info}); err != nil {
						return fmt.Errorf("回调函数执行错误: %w", err)
					}
				}
			}

			return nil
		}
	}

	err := filepath.Walk(cfg.Dir, walkFunc)
	if err != nil {
		return fmt.Errorf("遍历目录 %s 时发生错误: %w", cfg.Dir, err)
	}

	return nil
}

func ExitIfErr(err error) {
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
