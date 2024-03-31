

# 缓存穿透

请求一个不存在的资源，就会穿透缓存，并且每次都会查询数据库。如果接受大量这样的查询，系统就会崩溃。

## 解决方法

当黑客攻击时每次请求的资源都不一样的时候，就不能简单的用缓存空值来解决了。

1. 在查询到空数据的时候，`SETEX`一个空值或null。

```java
/**
  * 查询shop
  *
  * @param id shop主键
  * @return shop
  */
@Override
public Shop selectShopById(Long id)
{
    Shop shop = redis.getCacheObject(getCacheKey(id));
    if (StringUtils.isNotNull(shop)){
        return shop;
    }

    shop = shopMapper.selectShopById(id);
    if (StringUtils.isNotNull(shop)){
        redis.setCacheObject(getCacheKey(id),shop,CacheConstants.CACHE_SHOP_TTL, TimeUnit.MINUTES);
        return shop;
    }

    /* 防止缓存穿透，对于不存在的对象缓存一个无内容对象 */
    shop = new Shop();
    redis.setCacheObject(getCacheKey(id),shop,CacheConstants.CACHE_NULL_TTL, TimeUnit.MINUTES);
    return shop;
}

/**
  * 获取shop详细信息
  */
@GetMapping(value = "/{id}")
public AjaxResult getInfo(@PathVariable("id") Long id)
{
    Shop shop = shopService.selectShopById(id);
    if (StringUtils.isNotNull(shop.getId())){
        return success(shop);
    } else{
        return error("店铺不存在！");
    }

}
```

2. 在redis中缓存一个bitmap作为布隆过滤器。

# 缓存雪崩

在同一时刻有大量的缓存同时过期，或者缓存宕机了。这是有大量请求直接打到数据库。

## 解决方法

* 事前：Redis 高可用，主从+哨兵，Redis cluster，避免全盘崩溃。
* 事中：本地 ehcache 缓存 + hystrix 限流&降级，避免 MySQL 被打死。
* 事后：Redis 持久化，一旦重启，自动从磁盘上加载数据，快速恢复缓存数据。

# 缓存击穿

某部分高热点的key失效，在这一瞬间大量查询请求打到数据库。就像缓存屏障被凿了一个洞。

## 解决方法

* 对于基本不更新的数据，设置为永不过期
* 对于更新不频繁且构建缓存耗时较少的情况下，可以使用分布式锁的方式，只有获取锁的才可以构建缓存。其余线程获取到锁则从缓存中取。
* 对于更新频繁且构建缓存耗时长的，可以建立定时任务在缓存过去前主动的刷新缓存。

```java
/**
  * 根据字典类型查询字典数据
  * 
  * @param dictType 字典类型
  * @return 字典数据集合信息
  */
@Override
public List<SysDictData> selectDictDataByType(String dictType)
{
    List<SysDictData> dictDatas = DictUtils.getDictCache(dictType);
    if (StringUtils.isNotEmpty(dictDatas))
    {
        return dictDatas;
    }
    /* 分布式锁建立缓存 */
    Boolean res = Boolean.FALSE;
    while (!res){
        res = redis.cacheObjectIfAbsent(getLockKey(dictType),"",500, TimeUnit.MILLISECONDS);
    }
    dictDatas = dictDataMapper.selectDictDataByType(dictType);
    if (StringUtils.isNotEmpty(dictDatas))
    {
        DictUtils.setDictCache(dictType, dictDatas);
        return dictDatas;
    }
    return null;
}
```

```java
    /**
     * 根据字典类型查询字典数据
     * 
     * @param dictType 字典类型
     * @return 字典数据集合信息
     */
    @Override
    public List<SysDictData> selectDictDataByType(String dictType)
    {
        RedisData<List<SysDictData>> data = DictUtils.getDictCache(dictType);
        if (StringUtils.isNull(data)){
            return null;
        }

        List<SysDictData> dictDatas = data.getData();
        LocalDateTime expireTime = data.getExpireTime();
        if (LocalDateTime.now().isBefore(expireTime)){
            // 未过期
            return dictDatas;
        }
        // 已过期
        /* 分布式锁建立缓存 */
        String uuid = UUID.fastUUID().toString();
        Boolean res = redis.cacheObjectIfAbsent(getLockKey(dictType), uuid.toString(),500, TimeUnit.MILLISECONDS);
        if (res){
            dictDatas = dictDataMapper.selectDictDataByType(dictType);
            if (StringUtils.isNotEmpty(dictDatas))
            {
                DictUtils.setDictCache(dictType, dictDatas);
            }
            // 释放锁
            String flag = redis.getCacheObject(getLockKey(dictType));
            if (uuid.contentEquals(flag)){
                redis.deleteObject(getLockKey(dictType));
            }
        }
        return dictDatas;
    }
```

# Redis实现分布式锁

|        |           mysql           |        redis        |         zookeeper          |
| ------ | :-----------------------: | :-----------------: | :------------------------: |
| 互斥   | 利用mysql事务互斥锁的机制 |  利用redis的setnx   |  利用节点的唯一性和有序性  |
| 高可用 |            好             |         好          |             好             |
| 高性能 |           一般            |         好          |            一般            |
| 安全性 |    断开连接自动释放锁     | 使用redis的过期机制 | 临时节点，断开连接自动删除 |

## 锁实现思路

* 获取锁，到期自动释放。

`SET lock uuid EX 10 NX`

* 释放锁

释放时要判断锁值是否改变，防止误删。

`DEL lock`

# 秒杀超卖问题

使用乐观锁方式，在更新时判断`t.stock > 0`。

```sql
update tb_flash_sale_voucher t set t.stock = t.stock - 1
where t.voucher_id = #{voucherId} and t.stock > 0
```

# 异步秒杀

Redis判断库存，是否重复购买。成功后push到MQ。MQ异步消费队列，创建订单、扣减数据库库存。（最好用lua脚本实现。）

# Feed流

常见有两种模式

* Timeline模式

    不做内容筛选，简单按照发布内容时间线排序，常用于好友或者关注。例如朋友圈。

* 智能排序

    利用推荐算法推荐用户感兴趣的。例如抖音。

## 拉模式/读扩散实现方案

![image-20221122165208662](/images/image-20221122165208662.png)

## 推模式/写扩散

![image-20221122165341957](/images/image-20221122165341957.png)

## 推拉结合模式/读写混合

![image-20221122165526261](/images/image-20221122165526261.png)

## 分页问题

**滚动分页**：使用sortedSet，指定max 和min 、limit与offset。
