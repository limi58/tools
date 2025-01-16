package main

import (
	"file-tools/ssq"
	"file-tools/webp"
	"fmt"
	"log"
)

func main() {
	var input string
	fmt.Print("1.随机双色球\n")
	fmt.Print("2.批量转 webp\n")
	fmt.Print("--------------------------\n")
	fmt.Print("从以上选一个功能: ")
	fmt.Scanln(&input)
	if input == "" {
		log.Fatal("请输入具体数字")
	}
	switch input {
	case "1":
		ssq.Main()
	case "2":
		webp.Main()
	}
}
