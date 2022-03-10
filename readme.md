# 用于把proto文件转换成特定语言的api文件

1. 先把需要转换的proto文件确定好
2. 依次遍历proto文件，然后转换成ts文件

## 快速开始
``` bash
npm install -g proto2api

cd proto2api 

proto2api -d examples/hello.proto -o api
```
## 参考文档
Google Protobuf 语法指南 https://developers.google.com/protocol-buffers/docs/proto3