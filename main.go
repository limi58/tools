package main

/**

生成随机双色球：
go run main.go --tool=ssq --num=5

批量转 webp：
go run main.go --tool=webp --dir=/Users/admin/Documents/png --quality=80

批量转 heic：
go run main.go --tool=heic --dir=/Users/admin/Documents/png --quality=50

批量将文件命名为日期：
go run main.go --tool=filetime --dir=/Users/admin/Documents/png

*/

import (
	"flag"
	"fmt"
	"os"
	"tools/filetime"
	"tools/img"
	"tools/ssq"
)

func main() {
	tool := flag.String("tool", "", "哪个工具")

	// ssq
	num := flag.Int("num", 0, "生成双色球注数")

	// img
	dir := flag.String("dir", "", "处理目录")
	quality := flag.String("quality", "", "处理目录")

	flag.Parse()

	if *tool == "" {
		fmt.Println("未指定工具")
		os.Exit(1)
	}

	switch *tool {
	case "ssq":
		ssq.Main(ssq.Props{Num: *num})
	case "heic":
	case "webp":
		img.Main(img.Props{
			Dir:     *dir,
			Quality: *quality,
			Type:    *tool,
		})
	case "filetime":
		filetime.Main(filetime.Props{Dir: *dir})
	}
}
