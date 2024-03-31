# Spring事务三大基础设

1. PlatformTransactionManager：事务总的接口
2. TransactionDefinition：定义了事务的规则：隔离级别、传播属性、事务超市时间、是否只读事务等
3. TransactionStatus：定义了事务的状态

# 实现编程事务

applicatoinContext.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">
    <context:component-scan base-package="org.javatop.demo"/>
    <!--配置数据源-->
    <bean class="org.springframework.jdbc.datasource.DriverManagerDataSource" id="dataSource">
        <property name="password" value="root" />
        <property name="username" value="root" />
        <property name="url" value="jdbc:mysql://localhost/ry-vue?serverTimezone=Asia/Shanghai" />
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver" />
    </bean>
    <!--提供一个事务管理器-->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager" >
        <property name="dataSource" ref="dataSource" />
    </bean>
    <!--配置TransactionTemplate-->
    <bean class="org.springframework.transaction.support.TransactionTemplate" id="transactionTemplate">
        <property name="transactionManager" ref="transactionManager" />
    </bean>
    <!--配置JdbcTemplate-->
    <bean class="org.springframework.jdbc.core.JdbcTemplate" id="jdbcTemplate">
        <property name="dataSource" ref="dataSource" />
    </bean>
</beans>
```

UserService.java

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class UserService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private PlatformTransactionManager transactionManager;
    @Autowired
    private TransactionTemplate transactionTemplate;
	// 用TransactionTemplate实现编程事务
    public void transfer2(){
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                try {
                    jdbcTemplate.update("update sys_user set remark = ? where user_id = ? ","测试员","2");
                    int i = 1/0;
                } catch (DataAccessException e) {
                    status.setRollbackOnly();
                    e.printStackTrace();
                }
            }
        });
    }
	// 用transactionManager实现编程事务
    public void transfer() {
        TransactionDefinition definition = new DefaultTransactionDefinition();
        TransactionStatus status = transactionManager.getTransaction(definition);
        try {
            jdbcTemplate.update("update sys_user set remark = ? where user_id = ? ","测试员","2");
            transactionManager.commit(status);
        } catch (DataAccessException e) {
            e.printStackTrace();
            transactionManager.rollback(status);
        }
    }
}

```

Main类

```java
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class UserDemo {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext ctx = new ClassPathXmlApplicationContext("applicationContext.xml");
        UserService service = ctx.getBean(UserService.class);
        service.transfer2();
    }
}
```

# 声明式事务

applicationContext.xml增加

```xml
	<!--XML配置声明式事务三个步骤
    1。配置事务管理器
    2。配置事务通知
    3。配置事务AOP
    -->	
	<!--2。配置事务通知-->
    <tx:advice id="txAdvice" transaction-manager="transactionManager" >
        <tx:attributes>
            <tx:method name="add*"/>
            <tx:method name="delete*"/>
            <tx:method name="update*"/>
            <tx:method name="insert*"/>
            <tx:method name="transfer*"/>
        </tx:attributes>
    </tx:advice>

    <aop:config>
        <aop:pointcut id="pc1" expression="execution(* org.javatop.demo.UserService.*(..))"/>
        <aop:advisor advice-ref="txAdvice" pointcut-ref="pc1" />
    </aop:config>
```

maven依赖

```xml
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjrt</artifactId>
    <version>1.9.6</version>
</dependency>

<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
    <version>1.9.6</version>
</dependency>
```

代码

```java
public void transfer3() {
    jdbcTemplate.update("update sys_user set remark = ? where user_id = ? ","999","2");
    int i = 1 / 0;
}
```

# Java配置声明式事务

config代码

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

@Configuration
@ComponentScan("org.javatop.demo")
//开启java事务注解支持
@EnableTransactionManagement
public class TxConfig {

    @Bean
    DataSource dataSource(){
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setUsername("root");
        dataSource.setPassword("root");
        dataSource.setUrl("jdbc:mysql://localhost/ry-vue?serverTimezone=Asia/Shanghai");
        return dataSource;
    }

    @Bean
    PlatformTransactionManager transactionManager() {
        return new DataSourceTransactionManager(dataSource());
    }

    @Bean
    JdbcTemplate jdbcTemplate(){
        return new JdbcTemplate(dataSource());
    }
}
```

业务代码

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserService2 {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional
    public void transfer4() {
        jdbcTemplate.update("update sys_user set remark = ? where user_id = ? ","999","2");
        int i = 1 / 0;
    }

}
```

主启动类

```java
package org.javatop.demo;

import org.javatop.demo.Config.TxConfig;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

public class UserDemo2 {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext(TxConfig.class);
        UserService2 service = ctx.getBean(UserService2.class);
        service.transfer4();
    }
}
```

# Spring事务隔离性和传播性配置

## applicationContext.xml配置

```xml
<!--2。配置事务通知-->
    <tx:advice id="txAdvice" transaction-manager="transactionManager" >
        <tx:attributes>
            <!-- 在通知中配置 -->
            <tx:method name="add*" isolation="REPEATABLE_READ" propagation=""/>
            <tx:method name="delete*"/>
            <tx:method name="update*"/>
            <tx:method name="insert*"/>
            <tx:method name="transfer*"/>
        </tx:attributes>
    </tx:advice>
```

## Java声明式配置

```java
@Component
public class UserService2 {

    @Autowired
    private JdbcTemplate jdbcTemplate;
	// 注解里配置
    @Transactional(isolation = Isolation.REPEATABLE_READ,propagation = Propagation.MANDATORY)
    public void transfer4() {
        jdbcTemplate.update("update sys_user set remark = ? where user_id = ? ","999","2");
        int i = 1 / 0;
    }

}
```



## Java编程式配置

```java
@Component
public class UserService {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Autowired
    private PlatformTransactionManager transactionManager;
    @Autowired
    private TransactionTemplate transactionTemplate;

    public void transfer3() {
        jdbcTemplate.update("update sys_user set remark = ? where user_id = ? ","999","2");
        int i = 1 / 0;
    }

    public void transfer2(){
        // TransactionTemplate 在TransactionTemplate中设置
        transactionTemplate.setIsolationLevel(TransactionDefinition.ISOLATION_REPEATABLE_READ);
        transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_MANDATORY);
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                try {
                    jdbcTemplate.update("update sys_user set remark = ? where user_id = ? ","测试员","2");
                    int i = 1/0;
                } catch (DataAccessException e) {
                    status.setRollbackOnly();
                    e.printStackTrace();
                }
            }
        });
    }

    public void transfer() {
        DefaultTransactionDefinition definition = new DefaultTransactionDefinition();
        // PlatformTransactionManager在DefaultTransactionDefinition中配置
        definition.setIsolationLevel(TransactionDefinition.ISOLATION_REPEATABLE_READ);
        definition.setPropagationBehavior(TransactionDefinition.PROPAGATION_MANDATORY);
        TransactionStatus status = transactionManager.getTransaction(definition);
        try {
            jdbcTemplate.update("update sys_user set remark = ? where user_id = ? ","测试员","2");
            transactionManager.commit(status);
        } catch (DataAccessException e) {
            e.printStackTrace();
            transactionManager.rollback(status);
        }
    }
}
```

# 事务传播特性

## 事务传播特性REQUIRED（默认）

如果当前上下文中存在事务，那么加入该事务，如果不存在事务，创建一个事务，这是默认的传播属性值。

## 事务传播特性REQUIRES_NEW

每次都会新建一个事务，井且同时将上下文中的事务挂起，执行当前新建事务完成以后，上下文事务恢复再执行。

service

```java
@Service
public class UserService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserService2 service2;

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRES_NEW)
    public void transfer(){
        jdbcTemplate.update("update sys_user set remark = ? where user_id = ?","测试员",2);
        service2.transfer();
    }
}

@Service
public class UserService2 {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional(rollbackFor = Exception.class,propagation = Propagation.REQUIRES_NEW)
    public void transfer(){
        jdbcTemplate.update("update sys_user set remark = ? where user_id = ?","超级管理员",1);
    }
}
```

当where条件不是索引列的时候，mysql会产生表锁，接下来的事务因为第一个事务锁表而获取不到锁，就会产生死锁。

当UserService抛出异常而UserService2没有异常，UserService2的事务提交，UserService的事务回滚。

当UserService2抛出异常而UserService没有异常，如果UserService2的异常被处理掉（catch），外层就不会回滚，否则外层也回滚。

## 事务传播特性NESTED

如果当前上下文中存在事务，则嵌套事务执行，如果不存在事务，则新建事务。

## 事务传播特性MANDATORY

如果当前上下文中存在事务，否则抛出异常。

## 事务传播特性SUPPORTS

如果当前上下文存在事务，则支持事务加入事务，如果不存在事务，则使用非事务的方式执行。

## 事务传播特性NOT_SUPPORTS

如果当前上下文中存在事务，则挂起当前事务，然后新的方法在没有事务的环境中执行。

## 事务传播特性NEVER

如果当前上下文中存在事务，则拋出异常，否则在无事务环境上执行代码。

# 事务回滚规则

只有遇到RunTimeException和Error的子类异常才会回滚。

通过注解`@Transactional(rollbackFor = Exception.class`的rollbackFor设置会回滚的异常。`noRollbackFor`设置不会回滚的异常

# 只读事务

在同个一方法中有多个查询语句，为了防止多次查询一条语句的结果是不同的，就要加只读属性。只适用于`REQUIRED `或`REQUIRES_NEW`.

通过注解`@Transactional(readOnly = true)`的`readOnly`属性设置。

# 超时时间

通过注解`@Transactional(timeout = 2)`的`timeout`属性设置。默认是数据库的超时时间。单位秒。

# 注意事项

`@Transactional`修饰的方法必须是public。

以下情况，调用`tf()`，事务会失效。

```java
@Transactional
public void transfer(){
    jdbcTemplate.update("update sys_user set remark = ? where user_id = ?","999",2);
    service2.transfer();
}

public void tf(){
    transfer();
}
```

事务不会传播到新启动的线程中，最好都在主线程执行。
