# 过滤表达式

## 比较值

| English  | Alias  | C-like | 描述                              | Example                                    |
| :------- | :----- | :----- | :-------------------------------- | :----------------------------------------- |
| eq       | any_eq | ==     | 相等 (any if more than one)       | `ip.src == 10.0.0.5`                       |
| ne       | all_ne | !=     | 不等 (all if more than one)       | `ip.src != 10.0.0.5`                       |
|          | all_eq | ===    | 相等 (all if more than one)       | `ip.src === 10.0.0.5`                      |
|          | any_ne | !==    | 不等(any if more than one)        | `ip.src !== 10.0.0.5`                      |
| gt       |        | >      | 大于                              | `frame.len > 10`                           |
| lt       |        | <      | 小于                              | `frame.len < 128`                          |
| ge       |        | >=     | 大于等于                          | `frame.len ge 0x100`                       |
| le       |        | <=     | 小于等于                          | `frame.len <= 0x20`                        |
| contains |        |        | 协议, 字段 或 切片包含一个值      | `sip.To contains "a1762"`                  |
| matches  |        | ~      | 协议或文本字段匹配 一个正则表达式 | `http.host matches "acme\\.(org|com|net)"` |

## 逻辑表达式

| English | C-like | 描述         | Example                                                      |
| :------ | :----- | :----------- | :----------------------------------------------------------- |
| and     | &&     | 逻辑且       | `ip.src==10.0.0.5 and tcp.flags.fin`                         |
| or      | \|\|   | 逻辑或       | `ip.src==10.0.0.5 or ip.src==192.1.1.1`                      |
| xor     | ^^     | 逻辑异或     | `tr.dst[0:3] == 0.6.29 xor tr.src[0:3] == 0.6.29`            |
| not     | !      | 逻辑非       | `not llc`                                                    |
| […]     |        | 子序列       | See “Slice Operator” below.                                  |
| in      |        | 集合成员关系 | http.request.method in {"HEAD", "GET"}. See “Membership Operator” below. |