## 普通方式使用JDBC

```java
public class JdbcTest {
    private static final String URL = "jdbc:mysql://localhost:3306/spring";
    public static final String USERNAME = "root";
    public static final String PASSWORD = "root";

    public static void main(String[] args) throws SQLException {
        Connection connection = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver"); // 引入依赖并加载驱动程序。
            connection = DriverManager.getConnection(URL, USERNAME, PASSWORD); // 创建数据连接对象

            PreparedStatement preparedStatement = connection.prepareStatement("select * from user;"); // 创建 PreparedStatement 对象

            ResultSet resultSet = preparedStatement.executeQuery(); // 调用 Statement 对象的相关方法执行相对应的 SQL 语句
            while (resultSet.next()) {
                int id = resultSet.getInt("id");
                String username = resultSet.getString("name");
                int age = resultSet.getInt("age");
                String sex = resultSet.getString("sex");

                System.out.println("User (" + id  +"," +username + "," + age + "," + sex +")");
            }
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        } finally {
            if (connection != null) {
                connection.close(); // 关闭数据库连接。
            }
        }
    }
}

```

## Spring JDBC

1.   创建对应数据表的 PO。

     ```java
     public class User {
     	private int id;
         private String name;
         private int age;
         private String sex;
         // 省略构造器和setter/getter方法
     }
     ```

2.   创建表与实体间的映射

     ```java
     public class UserRowMapper implements RowMapper<User> {
         @Override
         public User mapRow(ResultSet rs, int rowNum) throws SQLException {
             return new User(rs.getInt("id"),rs.getString("name"),rs.getInt("age"),rs.getString("sex"));
         }
     }
     ```

3.   创建数据操作接口。

     ```java
     public interface UserService {
         void Save(User user);
         List<User> getUsers();
     }
     ```

4.   创建数据操作接口实现类。

```java
import java.sql.Types;
import java.util.List;

public class UserServiceImpl implements UserService{
    
    private JdbcTemplate jdbcTemplate;
    public void setDataSource(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    public void Save(User user) {
        jdbcTemplate.update("insert into user(name,age,sex)values(?,?,?)",
                new Object[]{user.getName(), user.getAge(),user.getSex()},
                new int[]{Types.VARCHAR, Types.INTEGER, Types.VARCHAR});
    }

   @Override
    public List<User> getUsers() {
        return jdbcTemplate.query("select * from user where age = ?",
                new Object[]{20}, 
                new int[] {Types.INTEGER},
                new UserRowMapper());
    }
}
```

5.   创建 Spring 配置文件。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
                      http://www.springframework.org/schema/beans/spring-beans-2.5.xsd">
    <!--配置数据源 -->
    <bean id="dataSource" class="org.apache.commons.dbcp2.BasicDataSource" destroy-method="close">
        <property name="driverClassName" value="com.mysql.jdbc.Driver" />
        <property name="url" value="jdbc:mysql://localhost:3306/lexueba" />
        <property name="username" value="root" />
        <property name="password" value="haojia0421xixi" />
        <!-- 连接池启动时的初始值 -->
        <property name="initialSize" value="1" />
        <!-- 连接池的最大值 -->
        <property name="maxTotal" value="300" />
        <!-- 最大空闲值.当经过一个高峰时间后, 连接池可以慢慢将已经用不到的连接慢慢释放一部分, 一直减少到maxIdle 为止 -->
        <property name="maxIdle" value="2" />
        <!-- 最小空闲值.当空闲的连接数少于阀值时,连接池就会预申请去一些连接,以免洪峰来时来不及申请 -->
        <property name="minIdle" value="1" />
    </bean>
    <!-- 配置业务 bean:PersonServiceBean -->
    <bean id="userService" class="service.UserServiceImpl">
        <!-- 向属性 dataSource 注入数据源 -->
        <property name="dataSource" ref="dataSource"></property>
    </bean>
</beans>
```

6.   测试

     ```java
     public class JdbcTest {
         public static void main(String[] args) {
             ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("jdbc/spring-jdbc.xml");
             UserService userService = context.getBean(UserService.class);
             User user = new User(1, "hbh", 20, "男");
             userService.save(user);
         }
     }
     ```

### save/update 功能的实现

UserServiceImpl 中 jdbcTemplate 的初始化是从 setDataSource 函数开始的。DataSource 的创建过程是引入第三方的连接池（dbcp连接池）。

让我们从`Save(User user)`函数开始了解：

```java
@Override
public void Save(User user) {
    jdbcTemplate.update("insert into user(name,age,sex)values(?,?,?)",
            new Object[]{user.getName(), user.getAge(),user.getSex()},
            new int[]{Types.VARCHAR, Types.INTEGER, Types.VARCHAR});
}
```

进入 jdbcTemplate 中的 update 方法。

```java
@Override
public int update(String sql, Object[] args, int[] argTypes) throws DataAccessException {
	return update(sql, newArgTypePreparedStatementSetter(args, argTypes));
}
protected PreparedStatementSetter newArgTypePreparedStatementSetter(Object[] args, int[] argTypes) {
    return new ArgumentTypePreparedStatementSetter(args, argTypes);
}

@Override
public int update(String sql, PreparedStatementSetter pss) throws DataAccessException {
    return update(new SimplePreparedStatementCreator(sql), pss);
}
```

进入 `update` 方法后,Spring 并不是急于进入核心处理操作,而是先做足准备工作,使用`ArgTypePreparedStatementSetter` 对参数与参数类型进行封装,同时又使用 `SimplePreparedStatementCreator` 对 SQL 语句进行封装。至于<u>为什么这么封装,暂且留下悬念</u>。

经过了数据封装后便可以进入了核心的数据处理代码了。

```java
protected int update(final PreparedStatementCreator psc, final PreparedStatementSetter pss)
			throws DataAccessException {

    logger.debug("Executing prepared SQL update");

    return execute(psc, new PreparedStatementCallback<Integer>() {
        @Override
        public Integer doInPreparedStatement(PreparedStatement ps) throws SQLException {
            try {
                if (pss != null) {
                    //设置 PreparedStatement 所需的全部参数。
                    pss.setValues(ps);
                }
                int rows = ps.executeUpdate();
                if (logger.isDebugEnabled()) {
                    logger.debug("SQL update affected " + rows + " rows");
                }
                return rows;
            }
            finally {
                if (pss instanceof ParameterDisposer) {
                    ((ParameterDisposer) pss).cleanupParameters();
                }
            }
        }
    });
}
```

`execute` 方法是最基础的操作,而其他操作比如`update`、`query` 等方法则是传入不同的 `PreparedStatementCallback` 参数来执行不同的逻辑。

### 基础方法 execute

`execute` 作为数据库操作的核心入口, 将大多数数据库操作相同的步骤统一封装, 而将个性化的操作使用参数 `PreparedStatementCallback` 进行回调。

```java
@Override
public <T> T execute(PreparedStatementCreator psc, PreparedStatementCallback<T> action)
        throws DataAccessException {

    Assert.notNull(psc, "PreparedStatementCreator must not be null");
    Assert.notNull(action, "Callback object must not be null");
    if (logger.isDebugEnabled()) {
        String sql = getSql(psc);
        logger.debug("Executing prepared SQL statement" + (sql != null ? " [" + sql + "]" : ""));
    }
    //获取数据库连接
    Connection con = DataSourceUtils.getConnection(getDataSource());
    PreparedStatement ps = null;
    try {
        Connection conToUse = con;
        if (this.nativeJdbcExtractor != null &&
                this.nativeJdbcExtractor.isNativeConnectionNecessaryForNativePreparedStatements()) {
            conToUse = this.nativeJdbcExtractor.getNativeConnection(con);
        }
        ps = psc.createPreparedStatement(conToUse);
        //应用用户设定的输入参数
        applyStatementSettings(ps);
        PreparedStatement psToUse = ps;
        if (this.nativeJdbcExtractor != null) {
            psToUse = this.nativeJdbcExtractor.getNativePreparedStatement(ps);
        }
        //调用回调函数
        T result = action.doInPreparedStatement(psToUse);
        handleWarnings(ps);
        return result;
    }
    catch (SQLException ex) {
        //释放数据库连接避免当异常转换器没有被初始化的时候出现潜在的连接池死锁
        if (psc instanceof ParameterDisposer) {
            ((ParameterDisposer) psc).cleanupParameters();
        }
        String sql = getSql(psc);
        psc = null;
        JdbcUtils.closeStatement(ps);
        ps = null;
        DataSourceUtils.releaseConnection(con, getDataSource());
        con = null;
        throw getExceptionTranslator().translate("PreparedStatementCallback", sql, ex);
    }
    finally {
        if (psc instanceof ParameterDisposer) {
            ((ParameterDisposer) psc).cleanupParameters();
        }
        JdbcUtils.closeStatement(ps);
        DataSourceUtils.releaseConnection(con, getDataSource());
    }
}
```

1.   获取数据库连接`DataSourceUtils.getConnectio()`

     ```java
     public static Connection getConnection(DataSource dataSource) throws CannotGetJdbcConnectionException {
         try {
             return doGetConnection(dataSource);
         }
         catch (SQLException ex) {
             throw new CannotGetJdbcConnectionException("Could not get JDBC Connection", ex);
         }
     }
     
     public static Connection doGetConnection(DataSource dataSource) throws SQLException {
         Assert.notNull(dataSource, "No DataSource specified");
     
         ConnectionHolder conHolder = (ConnectionHolder) TransactionSynchronizationManager.getResource(dataSource);
         if (conHolder != null && (conHolder.hasConnection() || conHolder.isSynchronizedWithTransaction())) {
             conHolder.requested();
             if (!conHolder.hasConnection()) {
                 logger.debug("Fetching resumed JDBC Connection from DataSource");
                 conHolder.setConnection(dataSource.getConnection());
             }
             return conHolder.getConnection();
         }
         // Else we either got no holder or an empty thread-bound holder here.
     
         logger.debug("Fetching JDBC Connection from DataSource");
         Connection con = dataSource.getConnection();
         //当前线程支持同步
         if (TransactionSynchronizationManager.isSynchronizationActive()) {
             try {
                 // Use same Connection for further JDBC actions within the transaction.
                 // Thread-bound object will get removed by synchronization at transaction completion.
                 // 在事务中使用同一数据库连接
                 ConnectionHolder holderToUse = conHolder;
                 if (holderToUse == null) {
                     holderToUse = new ConnectionHolder(con);
                 }
                 else {
                     holderToUse.setConnection(con);
                 }
                 //记录数据库连接
                 holderToUse.requested();
                 TransactionSynchronizationManager.registerSynchronization(
                         new ConnectionSynchronization(holderToUse, dataSource));
                 holderToUse.setSynchronizedWithTransaction(true);
                 if (holderToUse != conHolder) {
                     TransactionSynchronizationManager.bindResource(dataSource, holderToUse);
                 }
             }
             catch (RuntimeException ex) {
                 // Unexpected exception from external delegation call -> close Connection and rethrow.
                 releaseConnection(con, dataSource);
                 throw ex;
             }
         }
     
         return con;
     }
     ```

     2.   应用用户设定的输入参数

          ```java
          protected void applyStatementSettings(Statement stmt) throws SQLException {
              int fetchSize = getFetchSize();
              if (fetchSize != -1) {
                  stmt.setFetchSize(fetchSize);
              }
              int maxRows = getMaxRows();
              if (maxRows != -1) {
                  stmt.setMaxRows(maxRows);
              }
              DataSourceUtils.applyTimeout(stmt, getDataSource(), getQueryTimeout());
          }
          ```

          `setFetchSize` 最主要是为了减少网络交互次数设计的。访问 ResultSet 时,如果它每次只从服务器上读取一行数据, 则会产生大量的开销。 `setFetchSize` 的意思是当调用 rs.next 时, ResultSet 会一次性从服务器上取得多少行数据回来, 这样在下次 rs.next 时, 它可以直接从内存中获取数据而不需要网络交互,提高了效率。

          `setMaxRows` 将此 Statement 对象生成的所有 ResultSet 对象可以包含的最大行数限制设置为给定数。

3.   调用回调函数

处理一些通用方法外的个性化处理,也就是 `PreparedStatementCallback` 类型的参数的`doInPreparedStatement` 方法的回调。

4.   警告处理

     ```java
     protected void handleWarnings(Statement stmt) throws SQLException {
         //当设置为忽略警告时只尝试打印日志
         if (isIgnoreWarnings()) {
             if (logger.isDebugEnabled()) {
                 SQLWarning warningToLog = stmt.getWarnings();
                 while (warningToLog != null) {
                     logger.debug("SQLWarning ignored: SQL state '" + warningToLog.getSQLState() + "', error code '" +
                             warningToLog.getErrorCode() + "', message [" + warningToLog.getMessage() + "]");
                     warningToLog = warningToLog.getNextWarning();
                 }
             }
         }
         else {
             handleWarnings(stmt.getWarnings());
         }
     }
     ```

5.   资源释放`DataSourceUtils.releaseConnection(con, getDataSource())`

     ```java
     public static void releaseConnection(Connection con, DataSource dataSource) {
         try {
             doReleaseConnection(con, dataSource);
         }
         catch (SQLException ex) {
             logger.debug("Could not close JDBC Connection", ex);
         }
         catch (Throwable ex) {
             logger.debug("Unexpected exception on closing JDBC Connection", ex);
         }
     }
     public static void doReleaseConnection(Connection con, DataSource dataSource) throws SQLException {
         if (con == null) {
             return;
         }
         if (dataSource != null) {
             //当前线程存在事务的情况下说明存在共用数据库连接直接使用 ConnectionHolder 中的released 方法进行连接数减一而不是真正的释放连接。
             ConnectionHolder conHolder = (ConnectionHolder) TransactionSynchronizationManager.getResource(dataSource);
             if (conHolder != null && connectionEquals(conHolder, con)) {
                 // It's the transactional Connection: Don't close it.
                 conHolder.released();
                 return;
             }
         }
         doCloseConnection(con, dataSource);
     }
     public static void doCloseConnection(Connection con, DataSource dataSource) throws SQLException {
         if (!(dataSource instanceof SmartDataSource) || ((SmartDataSource) dataSource).shouldClose(con)) {
             con.close();
         }
     }
     ```

### Update 中的回调函数

PreparedStatementCallback 作为一个接口,其中只有一个函数 doInPreparedStatement,这个函数是用于调用通用方法 execute 的时候无法处理的一些个性化处理方法,在 update 中的函数实现:

```java
@Override
public Integer doInPreparedStatement(PreparedStatement ps) throws SQLException {
    try {
        if (pss != null) {
            //设置 PreparedStatement 所需的全部参数。
            pss.setValues(ps);
        }
        int rows = ps.executeUpdate();
        if (logger.isDebugEnabled()) {
            logger.debug("SQL update affected " + rows + " rows");
        }
        return rows;
    }
    finally {
        if (pss instanceof ParameterDisposer) {
            ((ParameterDisposer) pss).cleanupParameters();
        }
    }
}
```

对于设置输入参数的函数 pss.setValues (ps),我们有必要去深入研究一下。`org.springframework.jdbc.core.ArgumentTypePreparedStatementSetter#setValues()`

```java
@Override
public void setValues(PreparedStatement ps) throws SQLException {
    int parameterPosition = 1;
    if (this.args != null) {
        for (int i = 0; i < this.args.length; i++) {
            Object arg = this.args[i];
            if (arg instanceof Collection && this.argTypes[i] != Types.ARRAY) {
                Collection<?> entries = (Collection<?>) arg;
                for (Object entry : entries) {
                    if (entry instanceof Object[]) {
                        Object[] valueArray = ((Object[]) entry);
                        for (Object argValue : valueArray) {
                            doSetValue(ps, parameterPosition, this.argTypes[i], argValue);
                            parameterPosition++;
                        }
                    }
                    else {
                        doSetValue(ps, parameterPosition, this.argTypes[i], entry);
                        parameterPosition++;
                    }
                }
            }
            else {
                doSetValue(ps, parameterPosition, this.argTypes[i], arg);
                parameterPosition++;
            }
        }
    }
}

protected void doSetValue(PreparedStatement ps, int parameterPosition, int argType, Object argValue) throws SQLException {
	StatementCreatorUtils.setParameterValue(ps, parameterPosition, argType, argValue);
}
```

`org.springframework.jdbc.core.StatementCreatorUtils#setParameterValue(java.sql.PreparedStatement, int, int, java.lang.Object)`

```java
public static void setParameterValue(PreparedStatement ps, int paramIndex, int sqlType, Object inValue)
        throws SQLException {
    setParameterValueInternal(ps, paramIndex, sqlType, null, null, inValue);
}
private static void setParameterValueInternal(PreparedStatement ps, int paramIndex, int sqlType, String typeName, Integer scale, Object inValue) throws SQLException {

    String typeNameToUse = typeName;
    int sqlTypeToUse = sqlType;
    Object inValueToUse = inValue;

    // override type info?
    if (inValue instanceof SqlParameterValue) {
        SqlParameterValue parameterValue = (SqlParameterValue) inValue;
        if (logger.isDebugEnabled()) {
            logger.debug("Overriding type info with runtime info from SqlParameterValue: column index " + paramIndex +
                    ", SQL type " + parameterValue.getSqlType() + ", type name " + parameterValue.getTypeName());
        }
        if (parameterValue.getSqlType() != SqlTypeValue.TYPE_UNKNOWN) {
            sqlTypeToUse = parameterValue.getSqlType();
        }
        if (parameterValue.getTypeName() != null) {
            typeNameToUse = parameterValue.getTypeName();
        }
        inValueToUse = parameterValue.getValue();
    }

    if (logger.isTraceEnabled()) {
        logger.trace("Setting SQL statement parameter value: column index " + paramIndex +
                ", parameter value [" + inValueToUse +
                "], value class [" + (inValueToUse != null ? inValueToUse.getClass().getName() : "null") +
                "], SQL type " + (sqlTypeToUse == SqlTypeValue.TYPE_UNKNOWN ? "unknown" : Integer.toString(sqlTypeToUse)));
    }

    if (inValueToUse == null) {
        setNull(ps, paramIndex, sqlTypeToUse, typeNameToUse);
    }
    else {
        setValue(ps, paramIndex, sqlTypeToUse, typeNameToUse, scale, inValueToUse);
    }
}
```

### Query功能的实现

  ```java
  @Override
  public <T> List<T> query(String sql, Object[] args, int[] argTypes, RowMapper<T> rowMapper) throws DataAccessException {
      return query(sql, args, argTypes, new RowMapperResultSetExtractor<T>(rowMapper));
  }
  @Override
  public <T> T query(String sql, Object[] args, int[] argTypes, ResultSetExtractor<T> rse) throws DataAccessException {
      return query(sql, newArgTypePreparedStatementSetter(args, argTypes), rse);
  }
  @Override
  public <T> T query(String sql, PreparedStatementSetter pss, ResultSetExtractor<T> rse) throws DataAccessException {
      return query(new SimplePreparedStatementCreator(sql), pss, rse);
  }
  
  public <T> T query(PreparedStatementCreator psc, final PreparedStatementSetter pss, final ResultSetExtractor<T> rse) throws DataAccessException {
  
      Assert.notNull(rse, "ResultSetExtractor must not be null");
      logger.debug("Executing prepared SQL query");
  
      return execute(psc, new PreparedStatementCallback<T>() {
          @Override
          public T doInPreparedStatement(PreparedStatement ps) throws SQLException {
              ResultSet rs = null;
              try {
                  if (pss != null) {
                      pss.setValues(ps);
                  }
                  rs = ps.executeQuery();
                  ResultSet rsToUse = rs;
                  if (nativeJdbcExtractor != null) {
                      rsToUse = nativeJdbcExtractor.getNativeResultSet(rs);
                  }
                  return rse.extractData(rsToUse);
              }
              finally {
                  JdbcUtils.closeResultSet(rs);
                  if (pss instanceof ParameterDisposer) {
                      ((ParameterDisposer) pss).cleanupParameters();
                  }
              }
          }
      });
  }
  ```

可以看到整体套路与 update 差不多的,只不过在回调类 PreparedStatementCallback 的实现中使用的是 `ps.executeQuery()`执行查询操作,而且在返回方法上也做了一些额外的处理。

`rse.extractData(rsToUse);`方法负责将结果封装并转换为POJO。

**PreparedStatement和Statement区别**

*   `PreparedStatement`实例包含已编译的SQL语句。这就是使语句“准备好” 。包含于`PreparedStatement`对象中的SQL 语句可具有一个或多个IN参数。 IN参数的值在SQL 语句创建时未被指定。相反的，该语句为每个IN参数保留一个问号`?`作为占位符。每个问号的值必须在该语句执行之前，通过适当的`setXXX`方法来提供。 
*   由于PreparedStatement对象已预编译过,所以其执行速度要快于Statement对象。因此, 多次执行的SQL语句经常创建为`PreparedStatement`对象,以提高效率。

### queryForObject

Spring中不仅仅为我们提供了 query 方法, 还在此基础上做了封装, 提供了不同类型的 query 方法

```java
@Override
public <T> T queryForObject(String sql, Class<T> requiredType) throws DataAccessException {
    return queryForObject(sql, getSingleColumnRowMapper(requiredType));
}
@Override
public <T> T queryForObject(String sql, RowMapper<T> rowMapper) throws DataAccessException {
	List<T> results = query(sql, rowMapper);
	return DataAccessUtils.requiredSingleResult(results);
}
```

其实最大的不同还是对于 `RowMapper` 的使用。`SingleColumnRowMapper` 类中的 `mapRow`:

```java
@Override
@SuppressWarnings("unchecked")
public T mapRow(ResultSet rs, int rowNum) throws SQLException {
    // 验证返回结果数
    ResultSetMetaData rsmd = rs.getMetaData();
    int nrOfColumns = rsmd.getColumnCount();
    if (nrOfColumns != 1) {
        throw new IncorrectResultSetColumnCountException(1, nrOfColumns);
    }

    // 抽取第一个结果进行处理
    Object result = getColumnValue(rs, 1, this.requiredType);
    if (result != null && this.requiredType != null && !this.requiredType.isInstance(result)) {
        // 转换到对应的类型
        try {
            return (T) convertValueToRequiredType(result, this.requiredType);
        }
        catch (IllegalArgumentException ex) {
            throw new TypeMismatchDataAccessException(
                    "Type mismatch affecting row number " + rowNum + " and column type '" +
                    rsmd.getColumnTypeName(1) + "': " + ex.getMessage());
        }
    }
    return (T) result;
}
```

类型转换函数：

```java
@SuppressWarnings("unchecked")
protected Object convertValueToRequiredType(Object value, Class<?> requiredType) {
    if (String.class == requiredType) {
        return value.toString();
    }
    else if (Number.class.isAssignableFrom(requiredType)) {
        if (value instanceof Number) {
            // 转换原始Number类型到实体Number类
            return NumberUtils.convertNumberToTargetClass(((Number) value), (Class<Number>) requiredType);
        }
        else {
            // 转换string类型到实体Number类
            return NumberUtils.parseNumber(value.toString(),(Class<Number>) requiredType);
        }
    }
    else {
        throw new IllegalArgumentException(
                "Value [" + value + "] is of type [" + value.getClass().getName() +
                "] and cannot be converted to required type [" + requiredType.getName() + "]");
    }
}
```

