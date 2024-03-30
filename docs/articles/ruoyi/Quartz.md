# BaseController

## @InitBinder

`@Controller` 或 `@ControllerAdvice` 类中可以有 `@InitBinder` 标注的方法来初始化 `WebDataBinder`实例, 还可以：

* 将请求参数（即form或查询数据）绑定到模型对象。
* 将基于字符串的请求值（例如请求参数、路径变量、头、cookie 和其他）转换为控制器方法参数的目标类型。
* 在渲染HTML  forms时，将模型对象值格式化为`String`值。

`@InitBinder`可以注册`java.beans.PropertyEditor` 或 Spring `Converter` 和 `Formatter` 组件.

通常，它们是用`WebDataBinder`参数（用于注册）和`void`返回值声明的。

```java
@InitBinder
public void initBinder(WebDataBinder binder){
    // Date 类型转换
    binder.registerCustomEditor(Date.class, new PropertyEditorSupport()
    {
        @Override
        public void setAsText(String text)
        {
            setValue(DateUtils.parseDate(text));
        }
    });
}

@InitBinder
public void initBinder(WebDataBinder binder) {                
    binder.registerCustomEditor(Date.class, new CustomDateEditor(new SimpleDateFormat("yyyy-MM-dd"), false));     
}
```

`@InitBinder`方法支持许多与`@RequestMapping`方法相同的参数，但`@ModelAttribute`（命令对象）参数除外。

定义在`@Controller`中的方法为局部的，  `@ControllerAdvice` 中定义的是全局的。

# RequestContextHolder

`RequestContextHolder` 是 Spring 提供的一个用来暴露 Request 对象的工具，利用 RequestContextHolder，可以在一个请求线程中获取到 Request，避免了 Request 从头传到尾的情况。一般项目中，会对这个类再次进行封装，便于获取请求的相关的信息。

```java
public static ServletRequestAttributes getRequestAttributes(){
    RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
    return (ServletRequestAttributes) attributes;
}
/**
 * 获取request
 */
public static HttpServletRequest getRequest(){
    return getRequestAttributes().getRequest();
}
/**
 * 获取response
 */
public static HttpServletResponse getResponse(){
    return getRequestAttributes().getResponse();
}
/**
 * 获取session
 */
public static HttpSession getSession(){
    return getRequest().getSession();
}
/**
 * 获取String参数
 */
public static String getParameter(String name, String defaultValue){
    return Convert.toStr(getRequest().getParameter(name), defaultValue);
}
```

 `RequestContextHolder` 为什么需要 `inheritableRequestAttributesHolder` 和 `requestAttributesHolder` 两个 `ThreadLocal` 成员变量，这两个变量又有什么区别呢？`RequestContextHolder` 默认从 `requestAttributesHolder` 存取，但是在多线程的情况下，子线程无法访问父线程中的数据，即 `RequestContextHolder#getRequestAttributes` 返回 null，此时就需要用到 `inheritableRequestAttributesHolder`。`inheritableRequestAttributesHolder` 是 `NamedInheritableThreadLocal` 类型，`NamedInheritableThreadLocal` 继承于 `InheritableThreadLocal`，`InheritableThreadLocal` 实现了子线程从父线程继承数据，这样在子线程也可以访问父线程中 `InheritableThreadLocal` 的数据。

# Quartz

## 核心概念

1. **Job** 表示一个工作，要执行的具体内容。此接口中只有一个方法，如下：

    ```java
    void execute(JobExecutionContext context) 
    ```

2. **JobDetail** 表示一个具体的可执行的调度程序，Job 是这个可执行程调度程序所要执行的内容，另外 JobDetail 还包含了这个任务调度的方案和策略。
3. **Trigger** 代表一个调度参数的配置，什么时候去调。
4. **Scheduler** 代表一个调度容器，一个调度容器中可以注册多个 JobDetail 和 Trigger。当 Trigger 与 JobDetail 组合，就可以被 Scheduler 容器调度了。