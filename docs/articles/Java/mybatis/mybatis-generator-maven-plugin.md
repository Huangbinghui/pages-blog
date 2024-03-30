# mybatis-generator-maven-plugin插件使用

1、Maven依赖

```xml
<plugin>
    <groupId>org.mybatis.generator</groupId>
    <artifactId>mybatis-generator-maven-plugin</artifactId>
    <version>1.4.2</version>
    <configuration>
        <configurationFile>src/main/resources/generator/generatorConfig.xml</configurationFile>
        <overwrite>true</overwrite>
        <verbose>true</verbose>
    </configuration>
    <!-- 配置数据库链接及mybatis generator core依赖 生成mapper时使用 -->
    <dependencies>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <version>42.6.0</version>
        </dependency>
        <dependency>
            <groupId>org.mybatis.generator</groupId>
            <artifactId>mybatis-generator-core</artifactId>
            <version>1.4.2</version>
        </dependency>
    </dependencies>
</plugin>
```

2、新建generatorConfig配置文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE generatorConfiguration
        PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
<generatorConfiguration>
    <context id="DB2Tables" targetRuntime="MyBatis3">

        <commentGenerator>
            <property name="suppressDate" value="true"/>
            <!-- 是否去除自动生成的注释 true：是 ： false:否 -->
            <property name="suppressAllComments" value="false"/>
        </commentGenerator>

        <!-- 数据库链接URL，用户名、密码 -->
        <jdbcConnection driverClass="org.postgresql.Driver"
                        connectionURL="jdbc:postgresql://localhost:5432/lovetask"
                        userId="love"
                        password="love">
        </jdbcConnection>

        <!-- 类型转换 -->
        <javaTypeResolver>
            <!-- 是否使用BigDecimals，false可自动转化以下类型(Long Integer Short等) -->
            <property name="forceBigDecimals" value="false"/>
        </javaTypeResolver>

        <!-- 生成模型的包名和位置-->
        <javaModelGenerator targetPackage="com.hbh.lovetask.model" targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
            <property name="trimStrings" value="true"/>
        </javaModelGenerator>

        <!-- 生成映射文件的包名和位置-->
        <sqlMapGenerator targetPackage="mapper" targetProject="src/main/resources/">
            <property name="enableSubPackages" value="true"/>
        </sqlMapGenerator>

        <!-- 生成DAO的包名和位置 -->
        <javaClientGenerator type="XMLMAPPER" targetPackage="com.hbh.lovetask.mapper" targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
        </javaClientGenerator>

        <!-- 要生成的表 tableName是数据库中的表名或视图名 domainObjectName是实体类名-->
        <table tableName="lt_user" domainObjectName="User" enableCountByExample="false" enableUpdateByExample="true"
               enableDeleteByExample="true" enableSelectByExample="true" selectByExampleQueryId="true">
        </table>

        <table tableName="lt_task" domainObjectName="Task" enableCountByExample="true" enableUpdateByExample="true"
               enableDeleteByExample="true" enableSelectByExample="true" selectByExampleQueryId="true">
        </table>

        <table tableName="lt_point" domainObjectName="Point" enableCountByExample="true" enableUpdateByExample="true"
               enableDeleteByExample="true" enableSelectByExample="true" selectByExampleQueryId="true">
        </table>

        <table tableName="lt_love_relation" domainObjectName="LoveRelation" enableCountByExample="true"
               enableUpdateByExample="true"
               enableDeleteByExample="true" enableSelectByExample="true" selectByExampleQueryId="true">
        </table>

        <table tableName="lt_task_preset" domainObjectName="Preset" enableCountByExample="true"
               enableUpdateByExample="true"
               enableDeleteByExample="true" enableSelectByExample="true" selectByExampleQueryId="true">
        </table>

    </context>

</generatorConfiguration>
```

3、配置成功后，点击`Maven->插件->mybatis-generator->mybatis-generator:generate`

4、使用生成的mapper查询

```java
public User getUserById(Long id) {
    UserExample userExample = new UserExample();
    UserExample.Criteria criteria = userExample.createCriteria();
    criteria.andIdEqualTo(id);
    List<User> users = userMapper.selectByExample(userExample);

    if (users.size() == 1) {
        return users.get(0);
    } else {
        return null;
    }
}
```

多条件查询：

```java
/** select count(*) from demo WHERE ( a = ? and b = ? ) or ( a = ? and c = ? ) */ 
DemoExample example=new DemoExample();  
 
 example.or().andAEqualTo(?).andBEqualTo(?);
 example.or().andAEqualTo(?).andCEqualTo(?); 
 
 SqlSession sqlSession = MyBatisUtil.openSession();
 DemoMapper m = sqlSession.getMapper(DemoMapper.class);
 m.countByExample(example);
```