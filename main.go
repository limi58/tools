package main

import (
	"fmt"
	"os"
	"tools/filetime"
	"tools/img"
	"tools/ssq"
)

func main() {
	// fmt.Println(filepath.Join("/haha/xixi", "gege", ".png"))
	var input string
	fmt.Println("1.随机双色球")
	fmt.Println("2.批量转 heic")
	fmt.Println("3.批量转 webp")
	fmt.Println("4.文件名设为创建日期")
	fmt.Println("--------------------------")
	fmt.Print("从以上选一个功能 > ")
	fmt.Scanln(&input)
	if input == "" {
		fmt.Println("请输入具体数字")
		os.Exit(1)
	}
	switch input {
	case "1":
		ssq.Main()
	case "2":
		img.Main("heic")
	case "3":
		img.Main("webp")
	case "4":
		filetime.Main()
	}
}
