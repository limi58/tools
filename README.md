# file utils for nodejs

## install

git clone this repo, then `pnpm i`

## usage

- `npm run add-filename-date`

with some prompt, specific dir files name will be renamed by date and random string, the date is file create date

for example, dir path is `/User/pic`:

```
/User/pic/1.jpg
/User/pic/2.png
/User/pic/3.zip
```

will rename to

```
/User/pic/2023-02-22-1a.jpg
/User/pic/2018-01-11-aa.png
/User/pic/2022-01-01-2b.zip
```

- `npm run optimize-image`

with some prompt, specific dir files will reduce file size, current support jpeg, jpg, heic, png(to heic)

for example, dir path is `/User/pic`:

```
/User/pic/1.jpg
/User/pic/2.png
/User/pic/3.heic
```

will transform to

```
/User/pic/optimize-dist/1.jpg
/User/pic/optimize-dist/2.heic
/User/pic/optimize-dist/3.heic
```

base on [libvips](https://github.com/libvips/libvips), must install it
