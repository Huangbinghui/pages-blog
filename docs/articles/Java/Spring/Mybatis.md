## Mybatis独立使用

1.   建立PO

```java
public class User {
    private Integer id;
    private String name;
    private Integer age;

    public User(String name, Integer age) {
        this.name = name;
        this.age = age;
    }
    // //必须要有这个无参构造方法,不然根据 UserMapper.xml 中的配置,在查询数据库时,将不能反射构造出User 实例
    public User() {
        super();
    }
}
```

2.   建立Mapper

```java
public interface UserMapper {
    void insertUser(User user);
    User getUser(Integer id);
}
```

3.   建立配置文件

mybatis的配置有如下这些：

*   configuration（配置根元素）
    *   [properties（属性）](https://mybatis.org/mybatis-3/zh_CN/configuration.html#properties) 定义外在配置
    *   [settings（设置）](https://mybatis.org/mybatis-3/zh_CN/configuration.html#settings) 定义全局设置
    *   [typeAliases（类型别名）](https://mybatis.org/mybatis-3/zh_CN/configuration.html#typeAliases)
    *   [typeHandlers（类型处理器）](https://mybatis.org/mybatis-3/zh_CN/configuration.html#typeHandlers)也就是JAVA类型和数据库类型之间的转换关系。
    *   [objectFactory（对象工厂）](https://mybatis.org/mybatis-3/zh_CN/configuration.html#objectFactory)用于指定结果集对象是如何创建的
    *   [plugins（插件）](https://mybatis.org/mybatis-3/zh_CN/configuration.html#plugins)
    *   environments（环境配置）
        *   environment（环境变量）
            *   transactionManager（事务管理器）
            *   dataSource（数据源）
    *   [databaseIdProvider（数据库厂商标识）](https://mybatis.org/mybatis-3/zh_CN/configuration.html#databaseIdProvider)
    *   [mappers（映射器）](https://mybatis.org/mybatis-3/zh_CN/configuration.html#mappers)

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <properties resource="mybatis/config.properties">
        <property name="username" value="root"/>
        <property name="password" value="root"/>
    </properties>
    <!--    覆盖默认配置-->
    <settings>
        <!-- 全局性地开启或关闭所有映射器配置文件中已配置的任何缓存。 -->
        <setting name="cacheEnabled" value="false"/>
        <!--  延迟加载的全局开关。当开启时，所有关联对象都会延迟加载。-->
        <setting name="lazyLoadingEnabled" value="false"/>
        <!-- 允许 JDBC 支持自动生成主键，需要数据库驱动支持。-->
        <setting name="useGeneratedKeys" value="true"/>
        <!-- 配置默认的执行器。SIMPLE就是普通的执行器；REUSE执行器会重用预处理语句（PreparedStatement）； BATCH执行器不仅重用语句还会执行批量更新-->
        <setting name="defaultExecutorType" value="REUSE"/>
        <!-- 指定 MyBatis 所用日志的具体实现，未指定时将自动查找。-->
<!--        <setting name="logImpl" value="LOG4J2"/>-->
    </settings>
    <!--    类型别名-->
    <typeAliases>
        <typeAlias alias="User" type="com.hbh.mybatis.User"/>
    </typeAliases>

    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${driver}"/>
                <property name="url" value="${url}"/>
                <property name="username" value="${username}"/>
                <property name="password" value="${password}"/>
            </dataSource>
        </environment>
    </environments>

    <!-- 使用相对于类路径的资源引用 -->
    <mappers>
        <mapper resource="mybatis/UserMapper.xml"/>
    </mappers>

</configuration>
```

`mybatis/config.properties`配置如下：

```properties
driver=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/spring
```

4.   建立映射xml

```xml
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.hbh.mybatis.UserMapper">
    <!-- 这里namespace必须是UserMapper接口的类路径，不然会报错 -->
    <resultMap id="user" type="User">
        <id property="id" column="id"/>
        <result property="name" column="name"/>
        <result property="age" column="age"/>
    </resultMap>
    <!-- id要和UserMapper的接口方法相同，不然也会报错  -->
    <insert id="insertUser">
        insert into user(name,age) values (#{name}, #{age})
    </insert>
    <select id="getUser" resultType="com.hbh.mybatis.User" parameterType="integer">
        select * from user where id = #{id}
    </select>
</mapper>
```

5.   建立测试类

```java
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

import java.io.IOException;
import java.io.Reader;

public class MyBatisUtil {
    public static final SqlSessionFactory sqlSessionFactory;

    static {
        String resource = "mybatis/mybatis.xml";
        Reader reader = null;
        try {
            reader = Resources.getResourceAsReader(resource);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        sqlSessionFactory = new SqlSessionFactoryBuilder().build(reader);
    }

    public static SqlSessionFactory getSqlSessionFactory(){
        return sqlSessionFactory;
    }
}

public class TestMapper {
    static SqlSessionFactory sqlSessionFactory = MyBatisUtil.getSqlSessionFactory();

    @Test
    public void testAdd() {
        SqlSession sqlSession = sqlSessionFactory.openSession();
        try {
            UserMapper mapper = sqlSession.getMapper(UserMapper.class);
            User user = new User("hbh", 30);
            mapper.insertUser(user);
            sqlSession.commit(); // 这里一定要提交,不然数据进不去数据库中
        } finally {
            sqlSession.close();
        }
    }

    @Test
    public void testQuery(){
        SqlSession sqlSession = sqlSessionFactory.openSession();
        try {
            UserMapper mapper = sqlSession.getMapper(UserMapper.class);
            User user = mapper.getUser(1);
            System.out.println("name: "+user.getName()+"|age: "+user.getAge());
        } finally {
            sqlSession.close();
        }
    }

}
```

## Spring整合Mybatis

`User.java`和`UserMapper.java`、`UserMapper.xml`保持不变

引入依赖

```xml
<dependency>
  <groupId>org.mybatis</groupId>
  <artifactId>mybatis-spring</artifactId>
  <version>3.0.2</version>
</dependency>
```

1.  Spring配置文件

```java
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="dataSource" class="org.apache.commons.dbcp2.BasicDataSource">
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/spring"/>
        <property name="username" value="root"/>
        <property name="password" value="root"/>
        <property name="maxTotal" value="300"/>
        <property name="maxIdle" value="30"/>
        <property name="defaultAutoCommit" value="true"/>
    </bean>

    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="configLocation" value="classpath:springmybatis/mybatis-config.xml"/>
        <property name="dataSource" ref="dataSource"/>
    </bean>

    <bean id="userMapper" class="org.mybatis.spring.mapper.MapperFactoryBean">
        <property name="mapperInterface" value="com.hbh.mybatis.UserMapper"/>
        <property name="sqlSessionFactory" ref="sqlSessionFactory"/>
    </bean>
</beans>
```

对比独立使用Mybatis，我们发现environments中的配置dataSource被移到了Spring中进行配置。注册了`SqlSessionFactoryBean`和`MapperFactoryBean`两个Bean。现在Mybatis大多数配置都可以通过配置`SqlSessionFactoryBean`来实现。

2.   mybatis配置文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <typeAliases>
        <typeAlias alias="User" type="com.hbh.mybatis.User"/>
    </typeAliases>
    <mappers>
        <mapper resource="mybatis/UserMapper.xml"/>
    </mappers>
</configuration>
```

3.   测试

```java
public class UserServiceTest {
    public static void main(String[] args) {
        ApplicationContext context = new ClassPathXmlApplicationContext("springmybatis/spring.xml");
        UserMapper userMapper = (UserMapper) context.getBean("userMapper");
        User user = userMapper.getUser(1);
        System.out.println("name: "+user.getName()+" | age: "+user.getAge());
    }
}
```

通过对比可以看出，Mybatis-Spring简化了开发中的很多配置。

## 源码分析

### SqlSessionFactory的创建

通过配置文件发现，对于Mybatis配置文件的解析，Spring应该是通过`SqlSessionFactoryBean`实现的。这个类型的继承结构如下：

<img src="/Users/huangbinghui/Documents/LearnDoc/Java/Spring/assets/image-20240206101309512.png" alt="image-20240206101309512" style="zoom:50%;" />

从中找出重要的两个接口实现：`FactoryBean`和`InitializingBean`

*   `InitializingBean`：实现此接口的bean会在初始化时调用其`afterPropertiesSet`方法来进行bean的逻辑初始化。
*   `FactoryBean`：一旦bean实现此接口，那么通过`getBean`方法获取到的Bean其实是此类的`getObject`返回的实例。

**首先看`InitializingBean`：**

1.   `SqlSessionFactoryBean`的初始化

```java
@Override
public void afterPropertiesSet() throws Exception {
    notNull(dataSource, "Property 'dataSource' is required");
    notNull(sqlSessionFactoryBuilder, "Property 'sqlSessionFactoryBuilder' is required");
    state((configuration == null && configLocation == null) || !(configuration != null && configLocation != null),
        "Property 'configuration' and 'configLocation' can not specified with together");

    this.sqlSessionFactory = buildSqlSessionFactory();
}

protected SqlSessionFactory buildSqlSessionFactory() throws Exception {

    final Configuration targetConfiguration;
	// 解析xml配置，或Java形式的配置，放入targetConfiguration中
    XMLConfigBuilder xmlConfigBuilder = null;
    if (this.configuration != null) {
      targetConfiguration = this.configuration;
      if (targetConfiguration.getVariables() == null) {
        targetConfiguration.setVariables(this.configurationProperties);
      } else if (this.configurationProperties != null) {
        targetConfiguration.getVariables().putAll(this.configurationProperties);
      }
    } else if (this.configLocation != null) {
      xmlConfigBuilder = new XMLConfigBuilder(this.configLocation.getInputStream(), null, this.configurationProperties);
      targetConfiguration = xmlConfigBuilder.getConfiguration();
    } else {
      LOGGER.debug(
          () -> "Property 'configuration' or 'configLocation' not specified, using default MyBatis Configuration");
      targetConfiguration = new Configuration();
      Optional.ofNullable(this.configurationProperties).ifPresent(targetConfiguration::setVariables);
    }

    Optional.ofNullable(this.objectFactory).ifPresent(targetConfiguration::setObjectFactory);
    Optional.ofNullable(this.objectWrapperFactory).ifPresent(targetConfiguration::setObjectWrapperFactory);
    Optional.ofNullable(this.vfs).ifPresent(targetConfiguration::setVfsImpl);
	// 处理Java配置的typeAliasesPackage
    if (hasLength(this.typeAliasesPackage)) {
      scanClasses(this.typeAliasesPackage, this.typeAliasesSuperType).stream()
          .filter(clazz -> !clazz.isAnonymousClass()).filter(clazz -> !clazz.isInterface())
          .filter(clazz -> !clazz.isMemberClass()).forEach(targetConfiguration.getTypeAliasRegistry()::registerAlias);
    }
	// 处理Java配置的typeAliases
    if (!isEmpty(this.typeAliases)) {
      Stream.of(this.typeAliases).forEach(typeAlias -> {
        targetConfiguration.getTypeAliasRegistry().registerAlias(typeAlias);
        LOGGER.debug(() -> "Registered type alias: '" + typeAlias + "'");
      });
    }
	// 处理Java配置的plugins
    if (!isEmpty(this.plugins)) {
      Stream.of(this.plugins).forEach(plugin -> {
        targetConfiguration.addInterceptor(plugin);
        LOGGER.debug(() -> "Registered plugin: '" + plugin + "'");
      });
    }
	// 处理Java配置的typeHandlersPackage
    if (hasLength(this.typeHandlersPackage)) {
      scanClasses(this.typeHandlersPackage, TypeHandler.class).stream().filter(clazz -> !clazz.isAnonymousClass())
          .filter(clazz -> !clazz.isInterface()).filter(clazz -> !Modifier.isAbstract(clazz.getModifiers()))
          .forEach(targetConfiguration.getTypeHandlerRegistry()::register);
    }
	// 处理Java配置的typeHandlers
    if (!isEmpty(this.typeHandlers)) {
      Stream.of(this.typeHandlers).forEach(typeHandler -> {
        targetConfiguration.getTypeHandlerRegistry().register(typeHandler);
        LOGGER.debug(() -> "Registered type handler: '" + typeHandler + "'");
      });
    }
	// 设置枚举类型Handler
    targetConfiguration.setDefaultEnumTypeHandler(defaultEnumTypeHandler);

    if (!isEmpty(this.scriptingLanguageDrivers)) {
      Stream.of(this.scriptingLanguageDrivers).forEach(languageDriver -> {
        targetConfiguration.getLanguageRegistry().register(languageDriver);
        LOGGER.debug(() -> "Registered scripting language driver: '" + languageDriver + "'");
      });
    }
    Optional.ofNullable(this.defaultScriptingLanguageDriver)
        .ifPresent(targetConfiguration::setDefaultScriptingLanguage);

    if (this.databaseIdProvider != null) {// fix #64 set databaseId before parse mapper xmls
      try {
        targetConfiguration.setDatabaseId(this.databaseIdProvider.getDatabaseId(this.dataSource));
      } catch (SQLException e) {
        throw new IOException("Failed getting a databaseId", e);
      }
    }

    Optional.ofNullable(this.cache).ifPresent(targetConfiguration::addCache);

    if (xmlConfigBuilder != null) {
      try {
        xmlConfigBuilder.parse();
        LOGGER.debug(() -> "Parsed configuration file: '" + this.configLocation + "'");
      } catch (Exception ex) {
        throw new IOException("Failed to parse config resource: " + this.configLocation, ex);
      } finally {
        ErrorContext.instance().reset();
      }
    }

    targetConfiguration.setEnvironment(new Environment(this.environment,
        this.transactionFactory == null ? new SpringManagedTransactionFactory() : this.transactionFactory,
        this.dataSource));

    if (this.mapperLocations != null) {
      if (this.mapperLocations.length == 0) {
        LOGGER.warn(() -> "Property 'mapperLocations' was specified but matching resources are not found.");
      } else {
        for (Resource mapperLocation : this.mapperLocations) {
          if (mapperLocation == null) {
            continue;
          }
          try {
            XMLMapperBuilder xmlMapperBuilder = new XMLMapperBuilder(mapperLocation.getInputStream(),
                targetConfiguration, mapperLocation.toString(), targetConfiguration.getSqlFragments());
            xmlMapperBuilder.parse();
          } catch (Exception e) {
            throw new IOException("Failed to parse mapping resource: '" + mapperLocation + "'", e);
          } finally {
            ErrorContext.instance().reset();
          }
          LOGGER.debug(() -> "Parsed mapper file: '" + mapperLocation + "'");
        }
      }
    } else {
      LOGGER.debug(() -> "Property 'mapperLocations' was not specified.");
    }

    return this.sqlSessionFactoryBuilder.build(targetConfiguration);
}
```

从函数中我们可以看出，我们完全可以在`SqlSessionFactoryBean`中配置mybatis。

2.   获取`SqlSessionFactoryBean`

由于`SqlSessionFactoryBean`实现了`FactoryBean`，所以这个类返回的bean由`getObject`提供：

```java
@Override
public SqlSessionFactory getObject() throws Exception {
    if (this.sqlSessionFactory == null) {
      afterPropertiesSet();
    }
    return this.sqlSessionFactory;
}
```

### MapperFactoryBean的创建

单独使用Mybatis时，获取Mapper的方法是：

```java
 UserMapper mapper = sqlSession.getMapper(UserMapper.class);
```

这一过程中，其实是Mybatis根据配置信息为`UserMapper.class` 创建了代理类。而在Spring中则猜测是通过`MapperFactoryBean`实现的。

下面是MapperFactoryBean的继承结构：

<img src="/Users/huangbinghui/Documents/LearnDoc/Java/Spring/assets/image-20240206110055308.png" alt="image-20240206110055308" style="zoom:50%;" />

`FactoryBean`和`InitializingBean`依然是我们要关注的接口实现：

1.   MapperFactoryBean的初始化

```java
// DaoSupport.java
@Override
public final void afterPropertiesSet() throws IllegalArgumentException, BeanInitializationException {
    // Let abstract subclasses check their configuration.
    checkDaoConfig();

    // Let concrete implementations initialize themselves.
    try {
        initDao();
    }
    catch (Exception ex) {
        throw new BeanInitializationException("Initialization of DAO failed", ex);
    }
}
// SqlSessionDaoSupport.java
@Override
protected void checkDaoConfig() {
	notNull(this.sqlSessionTemplate, "Property 'sqlSessionFactory' or 'sqlSessionTemplate' are required");
}
// MapperFactoryBean.java
@Override
protected void checkDaoConfig() {
    super.checkDaoConfig();

    notNull(this.mapperInterface, "Property 'mapperInterface' is required");

    Configuration configuration = getSqlSession().getConfiguration();
    if (this.addToConfig && !configuration.hasMapper(this.mapperInterface)) {
      try {
        configuration.addMapper(this.mapperInterface);
      } catch (Exception e) {
        logger.error("Error while adding the mapper '" + this.mapperInterface + "' to configuration.", e);
        throw new IllegalArgumentException(e);
      } finally {
        ErrorContext.instance().reset();
      }
    }
}
```

`SqlSessionDaoSupport`中校验了`sqlSessionTemplate`不能空，而`sqlSessionTemplate`的初始化则是在`setSqlSessionFactory`中实现的。

```java
public void setSqlSessionFactory(SqlSessionFactory sqlSessionFactory) {
    if (this.sqlSessionTemplate == null || sqlSessionFactory != this.sqlSessionTemplate.getSqlSessionFactory()) {
      this.sqlSessionTemplate = createSqlSessionTemplate(sqlSessionFactory);
    }
}
```

2.   获取`MapperFactoryBean`的实例

```java
// MapperFactoryBean.java
@Override
public T getObject() throws Exception {
    return getSqlSession().getMapper(this.mapperInterface);
}
// SqlSessionDaoSupport.java
public SqlSession getSqlSession() {
    return this.sqlSessionTemplate;
}
```

### MapperScannerConfigurer

MapperScannerConfigurer可以扫描指定的包，自动帮我们创建映射器。减少配置工作量。可以使用`;`作为分隔符配置多个包路径。

```xml
<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer"> 
    <property name="basePackage" value="com.hbh.mybatis.mapper" />
</bean>
```

`MapperScannerConfigurer`继承结构如下：

<img src="/Users/huangbinghui/Documents/LearnDoc/Java/Spring/assets/image-20240206112559633.png" alt="image-20240206112559633" style="zoom:50%;" />

这个类也实现了`InitializingBean`接口，这个方法只对basePackage做了校验。

```java
@Override
public void afterPropertiesSet() throws Exception {
	notNull(this.basePackage, "Property 'basePackage' is required");
}
```

接下来看`BeanDefinitionRegistryPostProcessor`的实现：

```java
@Override
public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
    if (this.processPropertyPlaceHolders) {
      processPropertyPlaceHolders();
    }

    ClassPathMapperScanner scanner = new ClassPathMapperScanner(registry);
    scanner.setAddToConfig(this.addToConfig);
    scanner.setAnnotationClass(this.annotationClass);
    scanner.setMarkerInterface(this.markerInterface);
    scanner.setSqlSessionFactory(this.sqlSessionFactory);
    scanner.setSqlSessionTemplate(this.sqlSessionTemplate);
    scanner.setSqlSessionFactoryBeanName(this.sqlSessionFactoryBeanName);
    scanner.setSqlSessionTemplateBeanName(this.sqlSessionTemplateBeanName);
    scanner.setResourceLoader(this.applicationContext);
    scanner.setBeanNameGenerator(this.nameGenerator);
    scanner.setMapperFactoryBeanClass(this.mapperFactoryBeanClass);
    if (StringUtils.hasText(lazyInitialization)) {
      scanner.setLazyInitialization(Boolean.valueOf(lazyInitialization));
    }
    if (StringUtils.hasText(defaultScope)) {
      scanner.setDefaultScope(defaultScope);
    }
    scanner.registerFilters();
    scanner.scan(StringUtils.tokenizeToStringArray(this.basePackage, ConfigurableApplicationContext.CONFIG_LOCATION_DELIMITERS)); // 扫描Java文件
}
```

1.   `processPropertyPlaceHolders`的处理

```java
private void processPropertyPlaceHolders() {
    Map<String, PropertyResourceConfigurer> prcs = applicationContext.getBeansOfType(PropertyResourceConfigurer.class, false, false);

    if (!prcs.isEmpty() && applicationContext instanceof ConfigurableApplicationContext) {
      BeanDefinition mapperScannerBean = ((ConfigurableApplicationContext) applicationContext).getBeanFactory().getBeanDefinition(beanName);

      // PropertyResourceConfigurer does not expose any methods to explicitly perform
      // property placeholder substitution. Instead, create a BeanFactory that just
      // contains this mapper scanner and post process the factory.
      DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
      factory.registerBeanDefinition(beanName, mapperScannerBean);

      for (PropertyResourceConfigurer prc : prcs.values()) {
        prc.postProcessBeanFactory(factory);
      }

      PropertyValues values = mapperScannerBean.getPropertyValues();

      this.basePackage = getPropertyValue("basePackage", values);
      this.sqlSessionFactoryBeanName = getPropertyValue("sqlSessionFactoryBeanName", values);
      this.sqlSessionTemplateBeanName = getPropertyValue("sqlSessionTemplateBeanName", values);
      this.lazyInitialization = getPropertyValue("lazyInitialization", values);
      this.defaultScope = getPropertyValue("defaultScope", values);
    }
    this.basePackage = Optional.ofNullable(this.basePackage).map(getEnvironment()::resolvePlaceholders).orElse(null);
    this.sqlSessionFactoryBeanName = Optional.ofNullable(this.sqlSessionFactoryBeanName)
        .map(getEnvironment()::resolvePlaceholders).orElse(null);
    this.sqlSessionTemplateBeanName = Optional.ofNullable(this.sqlSessionTemplateBeanName)
        .map(getEnvironment()::resolvePlaceholders).orElse(null);
    this.lazyInitialization = Optional.ofNullable(this.lazyInitialization).map(getEnvironment()::resolvePlaceholders)
        .orElse(null);
    this.defaultScope = Optional.ofNullable(this.defaultScope).map(getEnvironment()::resolvePlaceholders).orElse(null);
}
```

`BeanDefinitionRegistries` 会在应用启动的时候调用, 并且会早于 `BeanFactoryPostProcessors` 的调用,这就意味着 `PropertyResourceConfigurers` 还没有被加载所有对于属性文件(properties文件)的引用将会失效。为避免此种情况发生,此方法手动地找出定义的 `PropertyResourceConfigurers` 并进行提前调用以保证对于属性的引用可以正常工作。

这一步解析配置文件中的`${}`引用。

2.   根据配置属性生成过滤器

```java
public void registerFilters() {
    boolean acceptAllInterfaces = true;

    // 对于annotationClass 属性的处理
    if (this.annotationClass != null) {
      addIncludeFilter(new AnnotationTypeFilter(this.annotationClass));
      acceptAllInterfaces = false;
    }

    // 对于markerInterface的处理
    if (this.markerInterface != null) {
      addIncludeFilter(new AssignableTypeFilter(this.markerInterface) {
        @Override
        protected boolean matchClassName(String className) {
          return false;
        }
      });
      acceptAllInterfaces = false;
    }

    if (acceptAllInterfaces) {
      // 增加默认过滤器
      addIncludeFilter((metadataReader, metadataReaderFactory) -> true);
    }

    // 排除 package-info.java
    addExcludeFilter((metadataReader, metadataReaderFactory) -> {
      String className = metadataReader.getClassMetadata().getClassName();
      return className.endsWith("package-info");
    });
}
```

3.   扫描Java文件

扫描工作是由`ClassPathMapperScanner`的`scan()`方法来实现的。

```java
public int scan(String... basePackages) {
    int beanCountAtScanStart = this.registry.getBeanDefinitionCount();

    doScan(basePackages);

    // 如果配置了includeAnnotationConfig,则注册对应的注解处理器以保证注解功能的正常使用
    if (this.includeAnnotationConfig) {
        AnnotationConfigUtils.registerAnnotationConfigProcessors(this.registry);
    }

    return (this.registry.getBeanDefinitionCount() - beanCountAtScanStart);
}
// ClassPathMapperScanner.java
@Override
public Set<BeanDefinitionHolder> doScan(String... basePackages) {
    Set<BeanDefinitionHolder> beanDefinitions = super.doScan(basePackages);
	// 如果没有扫描到任何文件，日志打印警告
    if (beanDefinitions.isEmpty()) {
      LOGGER.warn(() -> "No MyBatis mapper was found in '" + Arrays.toString(basePackages)
          + "' package. Please check your configuration.");
    } else {
      processBeanDefinitions(beanDefinitions);
    }

    return beanDefinitions;
}
// ClassPathBeanDefinitionScanner.java
protected Set<BeanDefinitionHolder> doScan(String... basePackages) {
    Assert.notEmpty(basePackages, "At least one base package must be specified");
    Set<BeanDefinitionHolder> beanDefinitions = new LinkedHashSet<BeanDefinitionHolder>();
    for (String basePackage : basePackages) {
        // 扫描basePackage下所有Java文件
        Set<BeanDefinition> candidates = findCandidateComponents(basePackage);
        for (BeanDefinition candidate : candidates) {
            // 解析Scope属性
            ScopeMetadata scopeMetadata = this.scopeMetadataResolver.resolveScopeMetadata(candidate);
            candidate.setScope(scopeMetadata.getScopeName());
            String beanName = this.beanNameGenerator.generateBeanName(candidate, this.registry);
            if (candidate instanceof AbstractBeanDefinition) {
                postProcessBeanDefinition((AbstractBeanDefinition) candidate, beanName);
            }
            if (candidate instanceof AnnotatedBeanDefinition) {
                //如果是 AnnotatedBeanDefinition 类型的 bean,需要检测下常用注解如: Primary、Lazy 等
                AnnotationConfigUtils.processCommonDefinitionAnnotations((AnnotatedBeanDefinition) candidate);
            }
            // 检测当前Bean是否已注册
            if (checkCandidate(beanName, candidate)) {
                BeanDefinitionHolder definitionHolder = new BeanDefinitionHolder(candidate, beanName);
                // 如果当前bean是用于生成代理的bean那么需要进一步处理
                definitionHolder = AnnotationConfigUtils.applyScopedProxyMode(scopeMetadata, definitionHolder, this.registry);
                beanDefinitions.add(definitionHolder);
                registerBeanDefinition(definitionHolder, this.registry);
            }
        }
    }
    return beanDefinitions;
}

private void processBeanDefinitions(Set<BeanDefinitionHolder> beanDefinitions) {
    AbstractBeanDefinition definition;
    BeanDefinitionRegistry registry = getRegistry();
    for (BeanDefinitionHolder holder : beanDefinitions) {
      definition = (AbstractBeanDefinition) holder.getBeanDefinition();
      boolean scopedProxy = false;
      if (ScopedProxyFactoryBean.class.getName().equals(definition.getBeanClassName())) {
        definition = (AbstractBeanDefinition) Optional
            .ofNullable(((RootBeanDefinition) definition).getDecoratedDefinition())
            .map(BeanDefinitionHolder::getBeanDefinition).orElseThrow(() -> new IllegalStateException(
                "The target bean definition of scoped proxy bean not found. Root bean definition[" + holder + "]"));
        scopedProxy = true;
      }
      String beanClassName = definition.getBeanClassName();
      LOGGER.debug(() -> "Creating MapperFactoryBean with name '" + holder.getBeanName() + "' and '" + beanClassName
          + "' mapperInterface");

      // the mapper interface is the original class of the bean
      // but, the actual class of the bean is MapperFactoryBean
      definition.getConstructorArgumentValues().addGenericArgumentValue(beanClassName); // issue #59
      try {
        // 开始构造MapperFactoryBean类型的Bean
        definition.getPropertyValues().add("mapperInterface", Resources.classForName(beanClassName));
      } catch (ClassNotFoundException ignore) {
        // ignore
      }

      definition.setBeanClass(this.mapperFactoryBeanClass);

      definition.getPropertyValues().add("addToConfig", this.addToConfig);

      // Attribute for MockitoPostProcessor
      // https://github.com/mybatis/spring-boot-starter/issues/475
      definition.setAttribute(FACTORY_BEAN_OBJECT_TYPE, beanClassName);

      boolean explicitFactoryUsed = false;
      if (StringUtils.hasText(this.sqlSessionFactoryBeanName)) {
        definition.getPropertyValues().add("sqlSessionFactory",
            new RuntimeBeanReference(this.sqlSessionFactoryBeanName));
        explicitFactoryUsed = true;
      } else if (this.sqlSessionFactory != null) {
        definition.getPropertyValues().add("sqlSessionFactory", this.sqlSessionFactory);
        explicitFactoryUsed = true;
      }

      if (StringUtils.hasText(this.sqlSessionTemplateBeanName)) {
        if (explicitFactoryUsed) {
          LOGGER.warn(
              () -> "Cannot use both: sqlSessionTemplate and sqlSessionFactory together. sqlSessionFactory is ignored.");
        }
        definition.getPropertyValues().add("sqlSessionTemplate",
            new RuntimeBeanReference(this.sqlSessionTemplateBeanName));
        explicitFactoryUsed = true;
      } else if (this.sqlSessionTemplate != null) {
        if (explicitFactoryUsed) {
          LOGGER.warn(
              () -> "Cannot use both: sqlSessionTemplate and sqlSessionFactory together. sqlSessionFactory is ignored.");
        }
        definition.getPropertyValues().add("sqlSessionTemplate", this.sqlSessionTemplate);
        explicitFactoryUsed = true;
      }

      if (!explicitFactoryUsed) {
        LOGGER.debug(() -> "Enabling autowire by type for MapperFactoryBean with name '" + holder.getBeanName() + "'.");
        definition.setAutowireMode(AbstractBeanDefinition.AUTOWIRE_BY_TYPE);
      }

      definition.setLazyInit(lazyInitialization);

      if (scopedProxy) {
        continue;
      }

      if (ConfigurableBeanFactory.SCOPE_SINGLETON.equals(definition.getScope()) && defaultScope != null) {
        definition.setScope(defaultScope);
      }

      if (!definition.isSingleton()) {
        BeanDefinitionHolder proxyHolder = ScopedProxyUtils.createScopedProxy(holder, registry, true);
        if (registry.containsBeanDefinition(proxyHolder.getBeanName())) {
          registry.removeBeanDefinition(proxyHolder.getBeanName());
        }
        registry.registerBeanDefinition(proxyHolder.getBeanName(), proxyHolder.getBeanDefinition());
      }

    }
}
```

