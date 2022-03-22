# 用于把proto文件转换成特定语言的api文件

1. 先把需要转换的proto文件确定好
2. 依次遍历proto文件，然后转换成ts文件

具体使用方式：https://www.yuque.com/yuexing0921/blog/ebmrh5

## 快速开始
``` bash
npm install -g proto2api

cd proto2api 

proto2api -d examples/hello.proto -o api
```
## 命令行说明
```
Usage: proto2api [options]

Convert proto file to api file

Options:
  -V, --version         output the version number
  --debug               Load code with ts-node for debug
  -d, --dir <type>      Directory address of Protocol Buffers. eq: /path/pbdir or /path/hello.proto
  -o, --output <type>   Output api path
  --apiName <type>      apiName (default: "webapi")
  --apiPath <type>      apiPath (default: "~/utils/api")
  --ignore [ignore...]  Ignore unnecessary generated pb files (default: "google|swagger")
```
## 参考文档
Google Protobuf 语法指南 https://developers.google.com/protocol-buffers/docs/proto3