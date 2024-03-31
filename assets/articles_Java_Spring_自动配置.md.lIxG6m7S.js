import{_ as o,c as i,o as t,a2 as e,ac as r,ad as a,ae as n,af as s}from"./chunks/framework.ClDkF6YQ.js";const B=JSON.parse('{"title":"查看配置的方法","description":"","frontmatter":{},"headers":[],"relativePath":"articles/Java/Spring/自动配置.md","filePath":"articles/Java/Spring/自动配置.md"}'),p={name:"articles/Java/Spring/自动配置.md"},c=e('<h1 id="查看配置的方法" tabindex="-1">查看配置的方法 <a class="header-anchor" href="#查看配置的方法" aria-label="Permalink to &quot;查看配置的方法&quot;">​</a></h1><ol><li><p>首先找到autoconfigure结尾的包<img src="'+r+'" alt="image-20231231090448039"></p></li><li><p>然后打开<code>META_INF/spring-autoconfigure-metadata.properties</code>文件，查找对应的自动配置类。<img src="'+a+'" alt="image-20231231092108569"></p></li><li><p>配置类中包含配置的导入<img src="'+n+'" alt="image-20231231092329375">然后就可以看到配置的信息。<img src="'+s+'" alt="image-20231231092404266"></p></li></ol><h1 id="自动配置原理" tabindex="-1">自动配置原理 <a class="header-anchor" href="#自动配置原理" aria-label="Permalink to &quot;自动配置原理&quot;">​</a></h1><p>Spring及SpringBoot里按条件创建Bean的核心是<code>@Condition</code>接口与<code>@Conditional</code>注解,其实在SpringBoot里还有一种AutoConfigure也可以来过滤配置，只不过使用这种技术，能够让SpringBoot更快速的启动。</p><p>SpringBoot使用一个Annotation的处理器来收集一些自动装配的条件，那么这些条件可以在<code>META-INF/spring-autoconfigure-metadata.properties</code>进行配置。</p><h1 id="spring-factories和spring-autoconfigure-metadata-properties区别" tabindex="-1">spring.factories和spring-autoconfigure-metadata.properties区别 <a class="header-anchor" href="#spring-factories和spring-autoconfigure-metadata-properties区别" aria-label="Permalink to &quot;spring.factories和spring-autoconfigure-metadata.properties区别&quot;">​</a></h1><blockquote><p>AI 内容有待校验</p></blockquote><p>共同点：</p><ol><li>都位于<code>META-INF</code>目录下</li><li>都是以key=value的形式配置</li><li>都用于实现Spring Boot自动配置</li></ol><p>不同点：</p><ol><li><p>内容和作用：</p><ul><li><strong><code>spring.factories</code>：</strong> 包含了自动配置类的类名，告诉 Spring Boot 在启动时应该自动配置哪些类。每个配置项的值是实际的自动配置类。</li><li><strong><code>spring-autoconfigure-metadata.properties</code>：</strong> 包含了自动配置类的元数据信息，用于定义<strong>条件和规则</strong>，以确定是否应该启用特定的自动配置类。</li></ul></li><li><p>文件结构：</p><ul><li><strong><code>spring.factories</code>：</strong> 是一个键值对的配置文件，键是接口或类，值是实际的自动配置类。它没有详细的条件信息。</li><li><strong><code>spring-autoconfigure-metadata.properties</code>：</strong> 包含了更详细的<strong>元数据信息</strong>，例如<strong>条件判断</strong>的细节。它通常包含了多行的配置，每一行都对应一个自动配置类，定义了启用该自动配置的条件。配置格式：<code>自动配置的类全名.条件=值</code></li></ul></li><li><p>加载时机：</p><ul><li><p><strong><code>spring.factories</code>：</strong> 在应用程序启动时由 Spring Boot 加载，用于确定需要自动配置哪些类。</p></li><li><p><strong><code>spring-autoconfigure-metadata.properties</code>：</strong> 也在应用程序启动时加载，但主要用于提供更详细的条件信息，帮助 Spring Boot 决定是否要应用某个自动配置类。</p></li></ul></li><li><p>可扩展性：</p><ul><li><strong><code>spring.factories</code>：</strong> 开发者可以通过修改或扩展该文件来自定义自动配置。</li><li><strong><code>spring-autoconfigure-metadata.properties</code>：</strong> 通常由 Spring Boot 自动生成，开发者较少直接操作该文件。</li></ul></li></ol>',11),l=[c];function g(d,u,_,m,f,h){return t(),i("div",null,l)}const A=o(p,[["render",g]]);export{B as __pageData,A as default};
