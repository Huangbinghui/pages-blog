# github鉴权登录

> git push代码到GitHub不再支持密码验证，需要生成token，用token验证。

1、使用token作为密码

```sh
git config --system --unset credential.helper
```

2、把token直接添加远程仓库链接中

```sh
export GITHUB_TOKEN=xxxxxx
git remote set-url origin "https://$GITHUB_TOKEN@github.com/huangbinghui/<REPO>.git"
```

