# 启动&连接

启动

```shell
redis-server
```

连接

```shell
redis-cli -h 127.0.0.1 -p 6379 -a 密码

127.0.0.1:6379> auth [username] password

127.0.0.1:6379> select 1 # 切换到1号库
OK
```

# 数据类型

redis是一个key-value数据库，key一般是字符串，value的类型可以有：

* string
* hash
* list
* set
* sorted Set
* geo
* bitmap
* hyperlog

前5种为基本类型。

# 通用命令

官网：https://redis.io/commands/

命令行：`help @group`

| 命令   | 描述                             |
| ------ | -------------------------------- |
| keys   | 列举匹配到的keys，不建议生产使用 |
| del    | 删除一个或多个key                |
| mset   | 批量设置key-value                |
| exists | 判断key是否存在                  |
| expire | 给一个key设置有效期              |
| ttl    | 查看一个key的剩余有效期（秒）    |
| pttl   | 查看一个key的剩余有效期（毫秒）  |

# String

可以分为三种类型：

* string：普通字符串
* int：整数类型，可做自增自减操作。
* float：浮点类型，可做自增自减操作。

存储时，string转化成字节码，int、float转化成二进制

| 命令        | 描述                                            |
| ----------- | ----------------------------------------------- |
| set         | 设置存储一个值                                  |
| get         | 获取一个key的值                                 |
| mset        | 批量设置                                        |
| mget        | 批量获取                                        |
| incr        | 自增                                            |
| incrby      | 自增指定步长                                    |
| decr        | 自减                                            |
| incrbyfloat | 浮点按步长自增                                  |
| setnx       | 添加一个键值对，前提这个key不存在，否则不执行。 |
| setex       | 添加一个键值对，并指定有效期。                  |

key用：分隔，在redis图形客户端上可以分组。

# Hash

| 命令                 | 描述                                             |
| -------------------- | ------------------------------------------------ |
| HSET key field value | 新增                                             |
| HGET key field       | 查询                                             |
| HMSET                | 批量新增多个field value                          |
| HMGET                | 批量查询多个field                                |
| HGETALL              | 查询key下的所有field                             |
| HKEYS                | 获取一个key中的所有field                         |
| HVALS                | 获取一个key中的所有value                         |
| HINCRBY              | 给一个hash field自增一个步长                     |
| HSETNX               | 设置一个key- field- value，如果field存在则不操作 |

# List

与Java的LinkedList类似。

| 命令                  | 描述                                                         |
| --------------------- | ------------------------------------------------------------ |
| LPUSH key element ... | 左侧插入一个或多个元素                                       |
| LPOP key              | 左侧移除一个元素，并返回                                     |
| RPUSH key element ... | 右侧插入一个或多个元素                                       |
| RPOP key              | 右侧移除一个元素，并返回                                     |
| LRANGE key start end  | 返回start到end范围的元素                                     |
| BLPOP/BRPOP           | 与LPOP/RPOP类似，只不过在没有元素的时候指定时间，而不是直接返回nil |

# Set

类似Java的HashSet

| 命令                  | 描述                          |
| --------------------- | ----------------------------- |
| SADD key element ...  | 向set中添加一个或多个元素     |
| SREM key element ...  | 移除set中一个或多个元素       |
| SCAND key             | 计算set中元素的个数           |
| SISMEMBER key element | 判断element是不是集合中的元素 |
| SMEMBERS              | 获取集合所有元素              |
| SINTER key1 key2 ...  | 求两个集合交集                |
| SDIFF key1 key2 ...   | 求差集                        |
| SUNION key1 key2 ...  | 求并集                        |

# SortedSet

类似Java的TreeSet

SortedSet中每个元素都有一个score属性，代表排序权重以此为依据排序。底层实现是跳表（SkipList）加hash表。

| 命令                         | 描述                           |
| ---------------------------- | ------------------------------ |
| ZADD key socre member        | 添加一个元素，如果已存在则更新 |
| ZREM key member              | 删除一个元素                   |
| ZSCORE key member            | 获取member的score              |
| ZRANK  key member            | 获取member的排名               |
| ZCARD key                    | 获取元素个数                   |
| ZCOUNT  key min max          | 统计指定范围内元素的个数       |
| ZINCRBY key increment member | 给member自增指定步长           |
| ZRANGE key min max           | 获取指定排名范围内的元素       |
| ZRANGEBYSCORE key min max    | 获取指定score范围内的元素      |
| ZDIFF、ZINTER、ZUNION        | 求差集、交集、并集             |

默认按升序排序，Z后加REV则按倒序排序计算。

# Java客户端对比

| 客户端   | 特征                                                         |
| -------- | ------------------------------------------------------------ |
| jedis    | 以Redis命令作为方法名称，学习成本低，但是线程不安全，多线程环境下要以连接池的方式使用 |
| lettuce  | 基于Netty实现，支持同步、异步和响应式编程模式，线程安全。支持哨兵模式集群模式和管道模式 |
| redisson | 基于Redis实现的分布式、可伸缩的Java数据结构集合。包含诸如Map、Semaphore、AtomicLong等强大功能。 |

