/* Newsletter Workflow — data model. Attached to window for cross-script (Babel) access. */
window.WF = {
  title: "電子報寫作工作流程",
  subtitle: "從一個想法，到一封可以發布的電子報 — 五個步驟，各由專屬 Skill 或 Sub-Agent 負責。",

  // Five island-realms. pos = % position of the marker over the map backdrop.
  realms: [
    {
      id: "r1", num: "1", roman: "Ⅰ", accent: "var(--realm-1)", accentHex: "#2b3447",
      title: "驗證選題", en: "Validate the Premise",
      slug: "thomas",
      agent: "Thomas", skill: "貝氏推斷", src: "claude code · bayesian-hypothesis-live",
      pos: { x: 20, y: 40.4 }, ground: { x: 17, y: 45 },
      say: "一個粗略的想法還站不住腳？讓我用貝氏推斷，設計競爭假說、逐條餵入證據、更新後驗機率，看看核心主張到底成不成立。",
      desc: "從一個粗略的想法開始。Thomas 用貝氏推斷設計競爭假說、逐條餵入證據、更新後驗機率，確認核心主張到底站不站得住腳。",
      flow: ["人工智慧普及，知識工作消失了？", "設計競爭假說 A·B·C", "逐條餵入證據", "更新後驗機率", "帶信心度的主張 ★★★★☆"],
      io: { in: "一個想法", out: "帶信心度的主張" },
      prompt: { cmd: "@draft.md", body: "Thomas 你看看" },
      shot: `assets/demo/01-thomas-bayes.png?v=${window.IMG_V}`
    },
    {
      id: "r2", num: "2", roman: "Ⅱ", accent: "var(--realm-2)", accentHex: "#4a7d72",
      title: "提煉 80 字摘要", en: "Distill to 80 Characters",
      slug: "feynman",
      agent: null, skill: "費曼 Skill", src: "claude code · feynman-review",
      pos: { x: 49.1, y: 41.2 }, ground: { x: 45, y: 43 },
      say: "如果一件事你講不清楚，就代表你還沒真正想通。把驗證過的主張壓縮成 80 字——逼出真懂。",
      desc: "用費曼的「誠實」標準，把驗證過的主張壓縮成 80 字。如果講不清楚，就代表還沒真正想通——這一步逼出真懂。",
      flow: ["驗證過的主張", "誠實檢驗：能不能講清楚？", "壓縮 · 去術語", "80 字摘要"],
      io: { in: "驗證過的主張", out: "80 字摘要" },
      prompt: { cmd: "/feynman-80-words", body: "想法流水账能让人学得更快更多更快...把这些内容写在之前的疑问和小任务。" },
      shot: `assets/demo/02-feynman.png?v=${window.IMG_V}`
    },
    {
      id: "r3", num: "3", roman: "Ⅲ", accent: "var(--realm-3)", accentHex: "#9a6a3c",
      title: "蒐集社群語料", en: "Gather Community Corpus",
      slug: "corpus",
      agent: null, skill: "語料搜尋", src: "corpus search · community",
      pos: { x: 71.3, y: 42.5 }, ground: { x: 72, y: 45 },
      say: "讀者真正在意什麼，用什麼語言說？我到社群裡搜尋貼文、討論串與案例，讓摘要扎根在真實的語言上。",
      desc: "到社群裡搜尋相關貼文、討論串與案例，讓摘要扎根在讀者真實的語言和關切上，而不是憑空想像。",
      flow: ["80 字摘要", "搜尋社群貼文 · 討論串", "比對讀者關切", "相關語料"],
      io: { in: "80 字摘要", out: "相關語料" },
      prompt: { body: "查找关于学习 Vibe Coding 的时候学得慢，学不会，没效率停留在表面的内容。" },
      shot: `assets/demo/03-corpus.png?v=${window.IMG_V}`
    },
    {
      id: "r4", num: "4", roman: "Ⅳ", accent: "var(--realm-4)", accentHex: "#6a5a82",
      title: "重構初稿", en: "Restructure the Draft",
      slug: "mcenerney",
      agent: null, skill: "McEnerney Skill", src: "claude code · mcenerney-opening-review",
      pos: { x: 16.6, y: 82.1 }, ground: { x: 17, y: 84 },
      say: "開篇要抓住人。用「問題結構」重寫：不穩定訊號、代價與收益、以及讀者需要被填補的 Gap。",
      desc: "用 McEnerney 的「問題結構」重寫初稿：不穩定訊號、代價／收益、以及讀者需要被填補的 Gap，讓開篇就抓住人。",
      flow: ["摘要 ＋ 語料", "不穩定訊號", "代價 ／ 收益", "填補 Gap", "結構化初稿"],
      io: { in: "摘要＋語料", out: "結構化初稿" },
      prompt: { cmd: "@draft.md /mcenerney-opening-review", body: "" },
      shot: `assets/demo/04-mcenerney.png?v=${window.IMG_V}`
    },
    {
      id: "r5", num: "5", roman: "Ⅴ", accent: "var(--realm-5)", accentHex: "#6f7a55",
      title: "校正小組", en: "The Correction Crew",
      slug: "crew",
      agent: null, skill: "Sub-Agents · 5 位專家", src: "sub-agents · parallel",
      pos: { x: 53.5, y: 84.7 }, ground: { x: 46, y: 84 },
      say: "我們五人各司其職，每位只做一件事、做到極致。並行打磨這份結構化初稿，直到它可以發布。",
      desc: "一組各司其職的 Sub-Agent 打磨結構化初稿，每位只做一件事、做到極致。",
      crew: true,
      io: { in: "結構化初稿", out: "可發布的電子報" },
      prompt: { cmd: "@draft.md", body: "走流程。" },
      shot: `assets/demo/05-crew.png?v=${window.IMG_V}`
    }
  ],

  crew: [
    {
      id: "c1", slug: "stone", name: "Stone", role: "結構檢查",
      job: "審查整體結構與邏輯流。",
      desc: "Stone 用「萬能概念講解結構」七步框架通讀全文，從是什麼／不是／類似／怎麼用／例子／錯用／練習 七個維度找出讀者最容易卡住的結構缺口，逐條補強。",
      shot: `assets/demo/05-stone.png?v=${window.IMG_V}`,
      framework: {
        title: "七步框架",
        dims: ["是什麼", "不是", "類似", "怎麼用", "例子", "錯用", "練習"]
      },
      audit: {
        edits: [
          {
            dimIndex: 0, title: "把單薄的定義補成完整定義",
            file: "draft.md", line: 12, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "keep", text: "让自己高效思考有个笨办法" },
              { kind: "del",  text: "——" },
              { kind: "add",  text: "，" },
              { kind: "keep", text: "把每条想法都写下来" },
              { kind: "del",  text: "，每条占一行" },
              { kind: "keep", text: "。这就是「想法流水账」。" },
              { kind: "add",  text: "它有三个特征：一行一条，问题在前答案在后，按时间线一条条往下排。叫「流水账」不是写得潦草，恰恰相反，是说你不挑、不删、不重组，想到啥写啥，按出现的顺序记下来。先这么干，再谈高级的。" }
            ]
          },
          {
            dimIndex: 2, title: "插入對比段,讀者不再混淆",
            file: "draft.md", line: 53, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "add", text: "你可能会想，这不就是子弹笔记、卡片笔记吗？还真不是。子弹笔记（Bullet Journal）管的是你今天要做的事，重点是任务清单。卡片笔记（Zettelkasten）管的是已经想清楚的知识，一张卡片一个概念，还要互相链接。费曼学习法是你学完之后，用大白话讲给别人听，验证自己懂没懂。而流水账管的是你正在想的问题，没整理、没结论，按时间一条条排下去。前三个是「已经完成」的整理，流水账是「正在发生」的现场。" }
            ]
          },
          {
            dimIndex: 5, title: "點出兩個錯誤操作,建議才有指向",
            file: "draft.md", line: 30, source: "Skill 能救 E 小姐的寫作嗎",
            parts: [
              { kind: "add", text: "她的问题出在两个地方：一是把分析文章和正式写文章都堆在同一个对话里，二是跨天写不同文章也不开新窗口，让 token 量持续累积。" }
            ]
          }
        ]
      }
    },
    {
      id: "c2", slug: "deva", name: "Deva", role: "刪廢句",
      job: "把已演出的內容又用文字說一遍的廢句刪掉。",
      desc: "Deva 用「Show Don't Tell」原則通讀全文，找出所有看破說破、翻譯比喻、重複交代和元評論的廢句，逐句刪掉,讓每一句都帶重量,讀者不再被多嘴的旁白打斷。",
      shot: `assets/demo/06-deva.png?v=${window.IMG_V}`,
      framework: {
        title: "看破說破",
        dims: ["說破感受", "翻譯比喻", "重複交代"]
      },
      audit: {
        edits: [
          {
            dimIndex: 0, title: "刪「卻沒什麼深度」,讀者已感覺到沒深度",
            file: "draft.md", line: 6, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "keep", text: "读完总结，感觉像是那么回事" },
              { kind: "del",  text: "，却没什么深度" },
              { kind: "keep", text: "。合上电脑，你还是说不上来新学的逻辑该怎么用。" }
            ]
          },
          {
            dimIndex: 2, title: "刪重述前面四項對比的總結句",
            file: "draft.md", line: 54, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "keep", text: "子弹笔记（Bullet Journal）管的是你今天要做的事，重点是任务清单。卡片笔记（Zettelkasten）管的是已经想清楚的知识，一张卡片一个概念，还要互相链接。费曼学习法是你学完之后，用大白话讲给别人听，验证自己懂没懂。而流水账管的是你正在想的问题，没整理、没结论，按时间一条条排下去。" },
              { kind: "del",  text: "前三个是「已经完成」的整理，流水账是「正在发生」的现场。" }
            ]
          },
          {
            dimIndex: 1, title: "刪比喻翻譯句,拋球畫面自己會說話",
            file: "draft.md", line: 65, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "keep", text: "这好比你在完「空中抛球」。你不仅要接住别人抛来的新球，还不能让旧球落地。这两个动作同时在消耗注意力。" },
              { kind: "del",  text: "一直接球的话，你的脑子里很快就转不动了。" },
              { kind: "keep", text: "而把想法写下来，就是把旧球放下，空出手来能解更多的新球。" }
            ]
          }
        ]
      }
    },
    {
      id: "c3", slug: "owen", name: "Owen", role: "口語化",
      job: "把書面腔的句子改成自然口語,讓讀者像在跟朋友聊天。",
      desc: "Owen 用「colloquial-review」原則通讀全文,找出所有新聞腔、報告腔、命令腔的句子,逐句替換成朋友吐槽、順口直說、輕鬆勸告的口語表達,讓文字讀起來不卡。",
      shot: `assets/demo/07-owen.png?v=${window.IMG_V}`,
      framework: {
        title: "口語化",
        dims: ["新聞腔", "報告腔", "命令腔"]
      },
      audit: {
        edits: [
          {
            dimIndex: 0, title: "多處小修,從新聞腔變成朋友吐槽",
            file: "draft.md", line: 8, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "del",  text: "让人奇怪的是" },
              { kind: "add",  text: "奇怪了" },
              { kind: "keep", text: "，你明明是社区" },
              { kind: "del",  text: "的" },
              { kind: "keep", text: "老人。" },
              { kind: "del",  text: "这大半年也累积了" },
              { kind: "add",  text: "大半年下来攒了" },
              { kind: "keep", text: "几百小时，每" },
              { kind: "del",  text: "月也花掉" },
              { kind: "add",  text: "个月还烧掉" },
              { kind: "keep", text: "大几百美金，" },
              { kind: "del",  text: "但你" },
              { kind: "keep", text: "到底在干啥" },
              { kind: "del",  text: "呢" },
              { kind: "keep", text: "？" }
            ]
          },
          {
            dimIndex: 1, title: "「其實問題出在」改成「說白了」,順口直說",
            file: "draft.md", line: 10, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "del",  text: "其实问题出在" },
              { kind: "add",  text: "说白了，" },
              { kind: "keep", text: "你" },
              { kind: "del",  text: "把" },
              { kind: "add",  text: "是把" },
              { kind: "keep", text: "思考" },
              { kind: "del",  text: "这件事" },
              { kind: "keep", text: "「外包」出去了。" }
            ]
          },
          {
            dimIndex: 2, title: "「記住不要」改成「千萬別」,別端著架子說話",
            file: "draft.md", line: 82, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "del",  text: "记住不要" },
              { kind: "add",  text: "千万别" },
              { kind: "keep", text: "让 AI 帮你" },
              { kind: "del",  text: "总结" },
              { kind: "add",  text: "写" },
              { kind: "keep", text: "。你可能会想，" },
              { kind: "del",  text: "既然是要留下" },
              { kind: "add",  text: "反正都是留个" },
              { kind: "keep", text: "记录，" },
              { kind: "del",  text: "那么为什么不让 AI 来写呢" },
              { kind: "add",  text: "让 AI 写不就行了" },
              { kind: "keep", text: "？还不" },
              { kind: "del",  text: "会" },
              { kind: "keep", text: "打断我和 Claude 的心流。" }
            ]
          }
        ]
      }
    },
    {
      id: "c4", slug: "percy", name: "Percy", role: "補細節",
      job: "把抽象句變成具體、有畫面的描述。",
      desc: "Percy 用「感知傳遞」原則通讀全文，找出抽象、空泛的句子，把它們換成具體的動作、內心獨白或場景對話，讓讀者用感官看見、聽見，而不是被告知。",
      shot: `assets/demo/08-percy.png?v=${window.IMG_V}`,
      framework: {
        title: "感知傳遞",
        dims: ["動作畫面", "內心獨白", "場景對話"]
      },
      audit: {
        edits: [
          {
            dimIndex: 2, title: "把抽象判斷換成具體場景對話",
            file: "draft.md", line: 6, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "del",  text: "你" },
              { kind: "keep", text: "盯着那张花花绿绿的导图，" },
              { kind: "del",  text: "看不懂" },
              { kind: "add",  text: "箭头从「Agent」拉到「Context」，又拐回「Memory」，一圈下来你也不知道该先看哪" },
              { kind: "keep", text: "。读完总结，" },
              { kind: "del",  text: "感觉像是那么回事" },
              { kind: "add",  text: "每段话都点头" },
              { kind: "keep", text: "，合上电脑，" },
              { kind: "del",  text: "你还是说不上来新学的逻辑该怎么用" },
              { kind: "add",  text: "朋友问你 Claude Code 的 Skill 到底解决了啥，你张嘴半天，挤出一句「就是……让它更聪明吧」" },
              { kind: "keep", text: "。" }
            ]
          },
          {
            dimIndex: 1, title: "把抽象「默念」換成內心獨白",
            file: "draft.md", line: 63, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "keep", text: "Baddelay 和 Hitch 还发现了一件更糟糕的事：哪怕上面那 4 个，你也要" },
              { kind: "del",  text: "不停地" },
              { kind: "keep", text: "在脑子里" },
              { kind: "del",  text: "默念" },
              { kind: "add",  text: "反复念「待会儿要重构那个函数、待会儿要重构那个函数」" },
              { kind: "keep", text: "，" },
              { kind: "del",  text: "才不会忘记" },
              { kind: "add",  text: "一停下就忘" },
              { kind: "keep", text: "。" }
            ]
          },
          {
            dimIndex: 0, title: "把假心流換成具體動作畫面",
            file: "draft.md", line: 88, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "keep", text: "你有没有想过，你可能在跑一个假的心流。你一个晚上" },
              { kind: "del",  text: "和 AI 一起砍瓜切菜，所有问题都被 AI 解决了" },
              { kind: "add",  text: "回车按到手指发酸，红色报错变绿色、绿色再冒红色，AI 一轮轮把坑填上" },
              { kind: "keep", text: "。但是第二天你回想起来，" },
              { kind: "del",  text: "好像自己没学到什么东西" },
              { kind: "add",  text: "问自己到底改了哪几个文件、为啥那么改，脑子一片空白" },
              { kind: "keep", text: "。" }
            ]
          }
        ]
      }
    },
    {
      id: "c5", slug: "vivian", name: "Vivian", role: "去重複結論",
      job: "刪掉預告與抽象總結,讓畫面自己說話。",
      desc: "Vivian 用「Show Don't Tell」原則通讀全文,抓出那些先告知再展示的鋪墊句、抽象總結,以及無力的抽象動詞,刪掉預告、換上有力的身體動詞,讓場景在讀者腦中自己發生。",
      shot: `assets/demo/09-vivian.png?v=${window.IMG_V}`,
      framework: {
        title: "Show Don't Tell",
        dims: ["不告知", "動詞畫面"]
      },
      audit: {
        edits: [
          {
            dimIndex: 0, title: "刪「規矩很簡單」鋪墊,直接展示規則",
            file: "draft.md", line: 12, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "keep", text: "这就是「想法流水账」。" },
              { kind: "del",  text: "规矩很简单：" },
              { kind: "keep", text: "一行一条，问题在前答案在后，按时间一条条往下排。" }
            ]
          },
          {
            dimIndex: 1, title: "把抽象「消耗注意力」換成「兩隻手繃著」",
            file: "draft.md", line: 65, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "keep", text: "就像你在玩「空中抛球」。你不仅要接住别人抛来的新球，还不能让旧球落地。" },
              { kind: "del",  text: "这两个动作同时在消耗注意力" },
              { kind: "add",  text: "两只手同时绷着" },
              { kind: "keep", text: "。" }
            ]
          },
          {
            dimIndex: 0, title: "刪抽象總結,讓「神經元被刺激」畫面自己說話",
            file: "draft.md", line: 84, source: "ch02 · 想法流水帳",
            parts: [
              { kind: "keep", text: "用自己的话写出来，" },
              { kind: "del",  text: "是在主动产出。大脑" },
              { kind: "keep", text: "神经元会被刺激，记得牢 20 - 24%。" }
            ]
          }
        ]
      }
    }
  ],

  final: { label: "產出 · Output", title: "可發布的電子報", note: "驗證 · 提煉 · 扎根語料 · 重構 · 五重打磨。" }
};
