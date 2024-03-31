export default {
  title: "辉辉", // 博客的标题
  description: "辉辉 的个人博客", // 博客的介绍
  base: "/blog/", // 如果想用 https://mlyz.wdy.github.io/blog/ 访问，那么这句话必填
  themeConfig: {
    logo: "/images/logo.png", // 页面上显示的logo
    nav: [
      // 页面右上角的导航
      { text: "计算机基础", link: "/articles/CS/index" },
      { text: "前端", link: "/articles/frontend/index" },
      {
        text: "JAVA",
        items: [
          // 可以配置成下拉
          { text: "泛型", link: "/articles/Java/泛型/类型擦除" },
          { text: "算法", link: "/articles/Java/算法/查找" },
          { text: "中间件", link: "/articles/Java/中间件/redis/HighAvailable" },
        ],
      },
    ],
    sidebar: {
      "/articles/CS/": [
        {
          text: "计算机基础",
          collapsed: true,
          items: [
            { text: "pg", link: "/articles/CS/pg/存储管理" },
            { text: "vim", link: "/articles/CS/vim/vim使用技巧" },
          ],
        },
      ],
      "/articles/Java/": [
        {
          text: "Java",
          collapsed: true,
          items: [
            { text: "泛型", link: "/articles/Java/泛型/类型擦除" },
            { text: "算法", link: "/articles/Java/算法/查找" },
            { text: "中间件", link: "/articles/Java/中间件/redis/HighAvailable" },
          ],
        },
      ],
    },
    socialLinks: [{ icon: "github", link: "https://github.com/Huangbinghui" }], // 可以连接到 github
  },
  ignoreDeadLinks: true,
};
