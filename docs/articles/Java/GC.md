# GC依据

## 引用计数法

每个对象中含有一个引用计数器，每当有引用指向该对象时，引用计数加 1。当引用离开作用域或被置为 **null** 时，引用计数减 1。

缺点：

* 对象循环引用时，那么它们的引用计数都不为 0，就会出现应该被回收但无法被回收的情况。

## 可达性分析法



# GC方式

1. 停止-复制
2. 标记-清除
3. 分代
4. 自适应

## 停止-复制

程序首先停止，然后把存活的对象从一个堆复制到另一个堆，剩下的就是“垃圾”。当对象移动时，所有指向该对象的引用都要修改。

缺点：

* 需要有两个堆，内存需求打了一倍。
* 程序一旦变得稳定就很少有垃圾产生，来回复制浪费资源。

## 标记-清除

从栈和静态存储开始，遍历所有引用以查找存活的对象。每找到一个存活的对象都设置一个标志，标记完成后开始清除。

缺点：

* 速度慢，只有垃圾少的时候速度快。

	## 分代

创建一个对象时，总是在Eden区操作，当这个区满了，那么就会触发一次Young GC，也就是年轻代的垃圾回收。

当Eden区再次被用完，就再触发一次Young GC，此时会将Eden区与From区还在被使用的对象复制到To区。

在下一次Young GC的时候，则是将Eden区与To区中的还在被使用的对象复制到From区。

若干次Young GC后，有些对象在From与To之间来回游荡，一旦超出阈值，就将它们复制到老年代。如果老年代被用完，则执行Full GC。

<img src="assets/image-20230316213131707.png" alt="image-20230316213131707" style="zoom:50%;" />

## 自适应

JVM会监控垃圾收集的效率，如果所有对象都很稳定，垃圾收集器效率很低的话，它会切换到“标记 – 清除”算法。同样，JVM会跟踪标记和清除的效果，如果堆里开始出现很多碎片，它会切换回“停止 – 复制”算法。

# 资源清理

## finalize()方法

>假设你的对象在**不使用** **new** 的情况下分配了一块“特殊”内存(例：JNDI)。垃圾收集器只知道如何释放由 new 分配的内存，所以它不知道如何释放对象的这块“特殊”内存。