# 自用高频小工具

生成随机双色球：

go run main.go --tool=ssq --num=5

批量转 avif：

go run main.go --tool=avif --dir=/Users/admin/Documents/png --quality=60

批量转 webp：

go run main.go --tool=webp --dir=/Users/admin/Documents/png --quality=80

批量转 heic：

go run main.go --tool=heic --dir=/Users/admin/Documents/png --quality=50

批量将文件命名为日期：

go run main.go --tool=filetime --dir=/Users/admin/Documents/png

图片处理基于 [libvips](https://github.com/libvips/libvips), 必须先安装：

Debian

```bash
sudo apt install libvips libvips-tools
```

MacOS

```bash
brew install vips
```

Windows

```bash
scoop bucket add extras
scoop update
scoop install libvips
```
