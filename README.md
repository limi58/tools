# 自用高频小工具

一个使用 Go 编写的命令行工具集合，包含双色球号码生成、图片格式转换、图片缩放和文件重命名等功能。

## 环境要求

- Go 1.23.2 或更高版本
- 图片处理功能需要安装 [libvips](https://github.com/libvips/libvips)

## 获取项目

```bash
git clone https://github.com/limi58/tools.git
cd tools
```

## 安装 libvips

### Debian / Ubuntu

```bash
sudo apt install libvips libvips-tools
```

### macOS

```bash
brew install vips
```

### Windows

Windows 可通过 [Scoop](https://github.com/ScoopInstaller/Scoop) 安装 libvips：

```powershell
scoop bucket add extras
scoop update
scoop install libvips
```

安装完成后，可运行以下命令检查 libvips 是否可用：

```bash
vips --version
```

## 运行

可以直接通过 Go 运行项目：

```bash
go run . --tool=<工具名称> [参数]
```

也可以先编译，再运行生成的可执行文件：

```bash
go build -o tools .
./tools --tool=<工具名称> [参数]
```

Windows PowerShell 中可以编译为 `.exe` 文件：

```powershell
go build -o tools.exe .
.\tools.exe --tool=<工具名称> [参数]
```

## 功能与用法

### 生成随机双色球号码

使用 `--num` 指定生成注数：

```bash
go run . --tool=ssq --num=5
```

### 批量转换为 AVIF

```bash
go run . --tool=avif --dir=/Users/admin/Documents/png --quality=60
```

### 批量转换为 WebP

```bash
go run . --tool=webp --dir=/Users/admin/Documents/png --quality=80
```

多帧或动画源默认只处理首帧。需要输出完整动画 WebP 时，添加 `--all-frame=1`：

```bash
go run . --tool=webp --dir=/Users/admin/Documents/png --quality=80 --all-frame=1
```

该参数会向 libvips 传递 `[n=-1]`，以加载源文件的全部帧。

### 批量转换为 HEIC

```bash
go run . --tool=heic --dir=/Users/admin/Documents/png --quality=50
```

### 批量等比缩小图片

使用 `--img_size` 指定缩放百分比。原图会保留，处理后的图片输出至指定目录下的 `img_size` 子目录：

```bash
go run . --tool=img_size --dir=/Users/admin/Documents/png --img_size=80
```

### 按日期批量重命名文件

```bash
go run . --tool=filetime --dir=/Users/admin/Documents/png
```

## 参数说明

| 参数 | 说明 | 适用工具 |
| --- | --- | --- |
| `--tool` | 指定要运行的工具 | 全部 |
| `--num` | 生成双色球号码的注数 | `ssq` |
| `--dir` | 要处理的目录 | 图片处理、`filetime` |
| `--quality` | 输出图片质量 | `avif`、`webp`、`heic` |
| `--img_size` | 图片缩放百分比，范围为 1–100 | `img_size` |
| `--all-frame` | 设置为 `1` 时处理全部帧 | `webp` |
