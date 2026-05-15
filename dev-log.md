# May 12 Thu
## 在 Claude Code 执行的时候，让一旁的 App 联动有哪些办法？共享状态文件 + 监听
- 共享状态文件 + 监听
  Skill 在每个阶段写入数据到 state.json，Web App 监听并更新展示
- Claude Code Hooks
  流程复杂，演示翻车时难恢复
- MCP工具
  需要 Web App 设计、暴露 MCP。复杂

### Demo 场景结论

Hackathon 现场选**方法一**：30 分钟内可实现，容错性最好。App 挂了直接退回终端输出，不影响 Live Demo 主流程，契合"mistakes embraced as part of the art"的回退预案。
## 我应该复制一份 Skill 专门用于展示嘛？**应该**
- 直接改 Skill，会污染原版
- 复制 Skill，原版干净
- 结合 Hooks，链路长，同理上一个问题的第二个选项 
# May 13 Wed
## Claude Code Design Skill 和 Claude Design 哪个好？ 都用，先 Claude Design
Options       | UI          | Token | Style
------------- | ----------- | ----- | --------
Claude Design | Webpage     | More  | New
Design Skill  | Claude Code | Less  | Keep Existing
我需要全面的视觉设计，先从 Design 开始，再走 Skill。

## Thomas Bayes 时代的印刷品风格是什么？ Found
Claude Code 的回复： 
Caslon，Baskerville字体。页边距相对宽，章节标题剧中，字号稍大，不夸张。手工棉麻纸，黑色油墨印压，米黄色。章首花饰（headpiece），尾花（tailpiece），首字下沉（drop cap）。
参考贝叶斯的论文：An Essay towards solving a Problem in the Doctrine of Chances.

## 贝叶斯论文的参考图片？Found
在 assets 目录下

## Claude Design 很长没有回复？缩小参考图
输入的参考图片有一个 1MB，推测太大了。

## 先开始页面设计还是系统设计？系统
推测系统可以把风格确定下来，页面就简单了。
给了 asserts 的参考图片和 reports 里的 print style 描述。

## 如何把中文 Noto Sans 字体混入？ 不用 Sans，改 Serif
Claude Design 选用了 Noto Serif。也可以接受，毕竟要模拟油墨印刷风格，而且都是大字体，识别度应该够用。

## Claude Design 会消耗大量 Claude Code 的用量么？未知
从 ClauDepot 没发现太多变化。但是笑来老师有说过会。

## 生成的 Design System 是个HTML，看不到效果？ 否
可以。需要耐心等待预览的渲染。

## 可以用现成的 index.html 基础上改造么？可以

## 取消中英混排的按钮等指示文字？ Done
混排的占用空间，而且小字体的情况下，中文衬线字识别度不高。

## 让假设内容变得更大？ Yes
因为 Demo 的时候，整个屏幕只有一半来显示这个内容，我旦夕观众看不清。
已经设计了支持窄屏幕的样子。

# May 14 Thu
## 观众想看的地方用 Noto Sans？Done
这里是观众最会看的地方，应该变得易读。可以用手动替换字体
- [x] 中间的四个假设文字
- [x] 当前证据的中文
- [x] 每一步的验证中文

## 观众想看的地方用 大字体？Done
- [x] 中间的四个假设文字
- [x] 当前证据的中文
  
## 支持那种class风格么？Yes
这样对多个类似的组件调节样式会方便许多
Claude Design 可以给出来class的名字方面后面调整
- [x] .hypothesis-name 中间的四个假设
- [x] .step-detail-text 底部每一条的当前证据文字
- [x] .hypothesis-roman 中间四个假设的顺序罗马符号

## 有的文字加入 Noto Sans 之后，会破坏整体视觉嘛？不会
检查过一次，可以的。有小地方需要重构。

## fix bug: 四个假设名字无法显示？ Done

## 如果有网络来源要显示在 App 上，可以点击？Done
保存到了 JSON，添加了样式，更新了 HTML

# May 15 Fri
## 四个假设标题重新开始时仍然保留上次内容的bug？Done
这个位置没有加入判断，所以重新开始也不会被刷新。现在加入了文字内容判断，如果不一样，会强制重新渲染。

## 添加一个重新开始的手动按钮？不
修复了上面的bug，这个按钮没有必要了。系统会自动刷新数据。增加也会让界面变得复杂。

## 添加滚动鼠标滚轮的回看功能？是
有助于Demo，但是需要屏蔽滚动页面，好在页面是全屏的，避开了这个逻辑。
滚动太快，就一下子到了头，需要增加delay。

## 加入尾页结论的部分？Done
需要展示一大段的总结建议。


# NEXT:

## 永远把主题问题显示在页面顶端?

## 更多的自定义的假设是否支持？

## 我们是否应该设计脚本来单独计算后验来保证准确？

5. show discuss Topic on the top always


