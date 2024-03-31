# High availability with Redis Sentinel

宏观层面Sentinel的能力：

1、 **监控**。Sentinel 会持续监测主从实例的健康状态。

2、**通知**。Sentinel 可以通过API通知系统管理员，被监控实例发生异常。

3、**自动故障切换**。当master下线，Sentinel 会提拔一个replica为master。其他replica会被重新配置，连接新master。

4、**提供配置**。Sentinel 作为服务发现的提供者。客户端连接Sentinel 来询问当前提供服务的主节点。如果故障切换发生，Sentinel 会通知新的地址。



# 快速开始

## 运行Sentinel

```sh
redis-sentinel /path/to/sentinel.conf
redis-server /path/to/sentinel.conf --sentinel
```

Sentinel运行命令强制携带conf参数，并且conf是可写的。这个文件将被用来保存当前状态。Sentinels 默认端口26379。

## Sentinel 部署要点

1. 至少三个Sentinel实例才能保证鲁棒性。
2. 三个Sentinel实例应当部署在各自独立的环境，以保证鲁棒性。
3. Sentinel + Redis分布式系统不保证故障期间写入被确认。因为redis的备份是异步的。
4. 需要用支持Sentinel 的客户端来访问。
5. **Sentinel, Docker,** 或者其他形式的NAT、端口映射需要小心处理。

## 配置Sentinel

```conf
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 60000
sentinel failover-timeout mymaster 180000
sentinel parallel-syncs mymaster 1

sentinel monitor resque 192.168.1.3 6380 4
sentinel down-after-milliseconds resque 10000
sentinel failover-timeout resque 180000
sentinel parallel-syncs resque 5
```

