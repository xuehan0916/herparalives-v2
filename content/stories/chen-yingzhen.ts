import { storySchema } from "../../lib/story-schema.ts";

// 标杆故事（草案）：受林巧稚启发的虚构女医生「陈映真」。
// 用途：验证《故事架构确认稿 v1》的字段是否够用——分叉→汇合、组合结局、
// 选项的获得/代价/未知/即时后果、延迟后果回响、虚构声明与审校记录。
// 正文为研发用占位文本，正式文案由内容负责人重写与审校；status 保持 draft，
// 不会出现在故事馆。
export const chenYingzhenStory = storySchema.parse({
  id: "chen-yingzhen-in-the-ward",
  version: "0.1.0",
  status: "draft",
  kind: "inspired",
  inspiredBy: {
    person: "林巧稚（仅作原型参考，不是传记）",
    note: "保留时代背景、妇产科领域、女性专业身份的困境类型；人物姓名、机构、事件组合、时间线均为虚构。",
    sources: [
      "北京协和医院《林巧稚：用一生践行医者仁心》",
      "新华社《“我是一辈子的值班医生”——纪念“万婴之母”林巧稚120周年诞辰》",
      "中国医学科学院北京协和医学院院士页面：林巧稚",
    ],
  },
  disclaimer: {
    text: "这是受真实人物启发的虚构互动故事，不是传记，也不是对真实人物人生的评判。文中机构均为虚构名称。",
    virtualInstitutions: true,
  },
  card: {
    name: "陈映真",
    tagline: "她替别人迎接生命，也要决定自己的生活",
    theme: "女性专业身份与投入的取舍",
    minutes: 20,
    intensity: "中",
    question: "在有限的时间里，她愿意把自己的生命投入什么？",
  },
  person: {
    ageRange: "二十多岁到四十岁",
    stage: "职业建立期",
    occupation: "妇产科医生",
    relations: ["反复来诊的女病人", "同科室的同行", "来信催她回乡的家人"],
    fixedFacts: [
      "在虚构的「北平协和式医学院」接受医学训练",
      "是所在科室里少数能独立主刀的女医生",
      "所有病例与机构均为虚构",
    ],
  },
  situation: {
    who: "陈映真，虚构人物。好胜、敏锐，对「被低估」格外敏感，选择妇产科是因为女病人需要一个能开口的对象。",
    wants: "把专业能力用在真正需要的地方，同时不把自己耗尽。",
    resources: ["扎实的临床训练", "同行的技术认可", "病人点名要她"],
    constraints: ["时代对女性角色的期待", "科室里有限的人力", "个人生活被长期推后"],
  },
  chapters: [
    {
      id: "chapter-1",
      title: "第一个不肯治疗的病人",
      forks: [
        {
          id: "CH-01",
          scenes: [
            "门诊的下午被挤得很满。陈映真翻到第三张病历，看见熟悉的名字：一位三十多岁的女人，反复来诊，持续腹痛、异常出血。检查提示需要进一步治疗，可能只是慢性炎症，也可能更糟。",
            "女人说，家里有孩子要照顾，丈夫不同意她花时间看病；她害怕真的查出什么。她不是不懂风险，是没有人为她承担风险之后的日子。",
          ],
          prompt: "她已经劝过两次。这一次，陈映真准备如何回应？",
          options: [
            {
              id: "ch01-keep-talking",
              text: "继续劝说，把风险讲得更具体",
              intent: "对这个人的承诺：先把话说透，再让她决定。",
              gain: "她可能真的听懂了，也可能愿意安排一次检查。",
              cost: "你要从别的病人身上挪出时间。",
              unknown: "她会不会因此更抗拒，觉得你在逼她。",
              outcome:
                "陈映真把下午的门诊往后推了二十分钟，用纸笔画出两种可能的结果。女人一直低头听着，最后说：那我下周再来一次。她不知道自己下周还来不来。",
              dimension: "relationship",
              direction: "up",
              reason: "你把时间交给了眼前这个人，而不是交给流程。",
              deltas: { relationship: 1 },
              sets: ["ch01_keep_talking"],
              next: "CH-02-clinic",
            },
            {
              id: "ch01-respect-choice",
              text: "尊重她的决定，告诉她「随时可以来」",
              intent: "对她的判断权的尊重：把决定交还给她。",
              gain: "她保住了自己安排生活的权力。",
              cost: "你可能错过一个更早的时机。",
              unknown: "她会不会把「尊重」听成「你不管我了」。",
              outcome:
                "陈映真把复查单放进信封，写下自己的门诊时间。女人道谢时没有看她的眼睛。那天下班，她在记录本上给这个名字画了一个点，提醒自己下次主动问一句。",
              dimension: "self",
              direction: "up",
              reason: "你没有替她做决定，也没有把责任推回给她。",
              deltas: { self: 1 },
              sets: ["ch01_respect_choice"],
              next: "CH-02-clinic",
            },
            {
              id: "ch01-refer",
              text: "转介给另一位医生，同时保持跟进",
              intent: "对她可能更需要别人的诚实。",
              gain: "换一种信任关系，也许她更容易开口。",
              cost: "她可能觉得自己被推走了。",
              unknown: "新的医生会不会像你一样有耐心。",
              outcome:
                "陈映真把病历交给同科室的一位老医生，详细说明了顾虑。她在交接单末尾写：家属反对，请留意。几天后，那位女人出现在公共卫生宣讲的现场，坐在最后一排。",
              dimension: "stability",
              direction: "up",
              reason: "你把信任交给更合适的人，也给自己留住了可持续的节奏。",
              deltas: { stability: 1 },
              sets: ["ch01_refer"],
              next: "CH-02-public",
            },
          ],
        },
      ],
      coach: {
        relationship:
          "你把这个人的时间放在了流程前面。被信任既是资源，也是消耗——你愿意为它付出多少？",
        self: "你没有替她做决定。把选择权还回去，有时比给建议更难。",
        stability: "你承认了自己不是唯一能帮上忙的人。这不是退让，是一种更长久的安排。",
      },
      coachDefault:
        "回看这个下午：你替她做了一次关于「投入」的练习。哪一种代价，是你当时没有说出口的？",
    },
    {
      id: "chapter-2",
      title: "她愿意投入什么",
      forks: [
        {
          id: "CH-02-clinic",
          scenes: [
            "一周后，一个需要长期随访的病例转到陈映真手上。她自己算过：如果每一例都按理想的方式做，她一周只能看一半的病人。",
            "同科室的同行提醒她，别把所有人的事都当成自己的事。她听懂了这句话的意思，也知道它不完全是善意。",
          ],
          prompt: "这一次，她准备把力气放在哪里？",
          options: [
            {
              id: "ch02-clinic-invest",
              text: "投入。按自己的标准把这一例做到底",
              intent: "对这个人的承诺，愿意用自己换来一次完整的照护。",
              gain: "病人得到最完整的照护，你的技术也被看见。",
              cost: "你能分给别人、分给自己的时间更少。",
              unknown: "下一个病例还是这样，你还扛得住几次。",
              outcome:
                "她把随访排进每一个休息日。三个月后，病人情况稳定，护士说这全靠她盯得紧。她点头，回到值班室才想起，自己已经很久没有完整睡过一个晚上。",
              dimension: "achievement",
              direction: "up",
              reason: "你把专业能力全部压在了这一例上。",
              deltas: { achievement: 2, self: -1 },
              sets: ["ch02_invest"],
              next: "CH-03",
            },
            {
              id: "ch02-clinic-boundary",
              text: "设定边界。明确自己能做和不能做的部分",
              intent: "对继续做医生的承诺：先让自己可持续。",
              gain: "你保住了能长期工作的节奏。",
              cost: "有些病人会觉得你不够尽力。",
              unknown: "边界会不会让你错过真正重要的时刻。",
              outcome:
                "陈映真把随访拆成固定时段，把急事交给值班同事。有病人家属在走廊里提高了声音。她站在原地听完，说：她能做的今天已经做完了。",
              dimension: "self",
              direction: "up",
              reason: "你把「可持续」放在了「做到最好」前面。",
              deltas: { self: 2, achievement: -1 },
              sets: ["ch02_boundary"],
              next: "CH-03",
            },
            {
              id: "ch02-clinic-collab",
              text: "寻求协作。请护士、同行和家人一起分担",
              intent: "承认她不必独自承担。",
              gain: "有人分担压力，影响面也更大。",
              cost: "协作需要信任，也常常不完美。",
              unknown: "同事愿不愿意长期参与。",
              outcome:
                "她把病例拿到科室例会上，第一次开口请人帮忙。老医生沉默了一会儿，说自己可以接一半随访。散会后，护士长塞给她一张排班表：这样你就不用每次都留到最后。",
              dimension: "relationship",
              direction: "up",
              reason: "你让这张网承担了一部分重量，而不是自己硬撑。",
              deltas: { relationship: 2, achievement: 1 },
              sets: ["ch02_collab"],
              next: "CH-03",
            },
          ],
        },
        {
          id: "CH-02-public",
          scenes: [
            "转介之后，陈映真开始留意那些「本来可以早来」的人。她们不是不知道，而是没有人告诉她们可以来。",
            "有人请她去做一次面向社区女工的宣讲。同一时间，门诊排了四个需要她亲自处理的病例。",
          ],
          prompt: "她把这一天放在哪一边？",
          options: [
            {
              id: "ch02-public-invest",
              text: "投入。把手术台那一端做到最深",
              intent: "对眼前这个人的承诺。",
              gain: "临床深度，更少的病人，更完整的介入。",
              cost: "系统的改变被一再推后。",
              unknown: "没有你推动的事，还能不能继续。",
              outcome:
                "她取消了宣讲，改到下一季。那四个病例都处理得很干净。可她在整理病历的时候意识到，真正让她难过的从来不是治不好的病，而是那些「本来可以早来」的人。",
              dimension: "achievement",
              direction: "up",
              reason: "你选择了看得见的这一次。",
              deltas: { achievement: 2, self: -1 },
              sets: ["ch02_invest"],
              next: "CH-03",
            },
            {
              id: "ch02-public-boundary",
              text: "设定边界。只做临床，把宣讲交给别人",
              intent: "对可持续节奏的承诺。",
              gain: "你的时间更清楚，精力更稳定。",
              cost: "那些没来得及的人，只能由别人去提醒。",
              unknown: "别人会不会把这件事认真做下去。",
              outcome:
                "她把讲稿交给一位年轻医生，把要点一条条写完。年轻人带着稿子去了社区，回来后说，现场有人第一次听说「可以不痛、可以早来」。陈映真说：那就好。",
              dimension: "self",
              direction: "up",
              reason: "你承认自己只能守住一部分。",
              deltas: { self: 2, achievement: -1 },
              sets: ["ch02_boundary"],
              next: "CH-03",
            },
            {
              id: "ch02-public-collab",
              text: "寻求协作。把宣讲变成科室共同的事",
              intent: "让这件事不必依赖某一个人。",
              gain: "影响面更广，也能持续。",
              cost: "要花时间协调，也会有人不情愿。",
              unknown: "科室愿不愿意把它长期做下去。",
              outcome:
                "她把宣讲做成科室的固定日程，把内容拆成每个人都能讲的一小段。第一次排班表贴出来时，有人抱怨，老医生却说：这件事早就该做了。",
              dimension: "relationship",
              direction: "up",
              reason: "你把一个人的坚持，变成了一群人的分工。",
              deltas: { relationship: 2, achievement: 1 },
              sets: ["ch02_collab"],
              next: "CH-03",
            },
          ],
        },
      ],
      coach: {
        achievement: "你把有限的时间压给了最确定的那件事。深度与广度，此刻只能选一个。",
        self: "你选择保留一部分自己。那不是不够投入，是另一种投入的前提。",
        relationship: "你没有独自承担。把重量摊开，需要信任，也需要承担别人做得不完美的部分。",
      },
      coachDefault:
        "这一周，你替她做了关于「投入」的决定。获得和代价，同时发生了吗？",
    },
    {
      id: "chapter-3",
      title: "一段可能出现的关系",
      forks: [
        {
          id: "CH-03",
          scenes: [
            "有一个人开始出现在她的日常里。对方知道值班意味着什么，也不要求她每次都准时。",
            "她发现，如果继续维持现在的生活，这段关系不会自己变成她想要的样子。她必须腾出一点空间，而空间只能从别的地方挪。",
          ],
          prompt: "关于这段关系，她准备怎么做？",
          options: [
            {
              id: "ch03-try",
              text: "尝试调整。留出固定的时间给这段关系",
              intent: "对另一种人生可能的好奇。",
              gain: "她试过之后才知道自己能不能做。",
              cost: "她会在一些时刻感到自己「不够投入」。",
              unknown: "她能不能长期维持这种分配。",
              outcome:
                "陈映真在排班表上圈出周四晚上，把它当成一个不能随意改动的门诊约定。第一次赴约她迟到了四十分钟。对方没有生气，只说：你来了。",
              dimension: "relationship",
              direction: "up",
              reason: "你把一段关系写进了需要被分配的时间里。",
              deltas: { relationship: 2, self: -1 },
              sets: ["ch03_try"],
            },
            {
              id: "ch03-explain",
              text: "诚实说明现状：我现在能给的只有这么多",
              intent: "对已知的自己的诚实。",
              gain: "对方知道了真实情况，选择就变成双方的事。",
              cost: "可能失去对方，也可能失去这段时间。",
              unknown: "对方能接受多少，能等多久。",
              outcome:
                "她把自己能给出和不能给出的部分，一条条说清楚。对方听完，很久没有说话，最后问：那你希望我怎么安排我的期待？",
              dimension: "self",
              direction: "up",
              reason: "你没有美化自己的能力，也没有替对方做决定。",
              deltas: { self: 1, relationship: 1 },
              sets: ["ch03_explain"],
            },
            {
              id: "ch03-decline",
              text: "不进入。承认自己不愿意或做不到分心",
              intent: "对已知的自己的诚实（另一种形式）。",
              gain: "她保住了完整的时间与精力。",
              cost: "放弃一种可能的亲密。",
              unknown: "多年以后，她会不会重新想起这段可能。",
              outcome:
                "她说：我现在不适合。对方点了点头，没有追问。那天晚上，她回到值班室，把电话放在床头，像过去很多个夜晚一样，等它响。",
              dimension: "self",
              direction: "up",
              reason: "你选择了确定的生活结构，而不是不确定的可能。",
              deltas: { self: 2 },
              sets: ["ch03_decline"],
            },
          ],
        },
      ],
      coach: {
        relationship: "你把一段关系放进了日程。那既是对别人的承诺，也是对自己的某种允许。",
        self: "你选择了诚实地描述自己能给的部分。诚实有时意味着先失去，再看见。",
      },
      coachDefault:
        "关于「保留一部分自己」，她给出的答案是什么？你又想起了自己的哪一段？",
    },
  ],
  endings: [
    {
      id: "deep-clinic",
      title: "她把能力压在一个人身上",
      text: "她的名字开始和「救得回来」连在一起。病人点名要她，同行也承认她的技术。她的日常被排班填满，能记住的休息日越来越少。她得到了深度，也把自己变成了一种稀缺资源。",
      requires: ["ch02_invest"],
      losses: ["可分配给他人的时间", "个人生活的连续性"],
      unresolved: ["她还能这样撑多久", "当她撑不住时，谁能接住她"],
    },
    {
      id: "sustainable",
      title: "她决定先做一个能长期工作的人",
      text: "她开始把边界写在纸上：能做什么，不能做什么，什么时候必须停。有人不满意，也有人因此更信任她。她没有成为传说里的那种医生，但她每天都能走进诊室。",
      requires: ["ch02_boundary"],
      losses: ["部分病人的期待", "某些「做到最好」的机会"],
      unresolved: ["边界是否会在关键时刻挡住她"],
    },
    {
      id: "collective",
      title: "她把一个人的坚持，变成一群人的分工",
      text: "宣讲、随访、排班，都不再只靠她一个人。事情推进得更慢，也更容易被继承。她第一次发现，影响面并不等于自己多做了什么，而是别人愿不愿意接着做。",
      requires: ["ch02_collab"],
      losses: ["对结果的完全掌控", "与同事磨合的时间"],
      unresolved: ["别人愿不愿意长期做下去"],
    },
    {
      id: "unresolved-ending",
      title: "她仍在里面",
      text: "没有哪一条路被走到底。她仍在门诊、病房和电话之间来回，仍在决定下一步把力气放在哪里。有些选择还没有结果，这本身也是一种结果。",
      fallback: true,
      requires: [],
      losses: [],
      unresolved: ["她最终会把生活安排成什么样"],
    },
  ],
  closingQuestion:
    "在陈映真的这些选择里，哪一种代价是你愿意承担的？哪一种，你想留到下一次再回答？",
  aiAssisted: true,
  access: "free",
  qa: {
    testCriteria: [
      "三个选项各自保护不同的东西，都需要付出代价",
      "「尊重病人决定」不被写成消极选项",
      "「设定边界」不被读成不够投入",
      "三个结局各有收益、损失与未解决问题，没有正确组合",
    ],
    counterExamples: [
      "伪选择（选项实际结果相同）",
      "隐藏正确答案",
      "把独处写成失败、把投入写成高尚",
      "把生育与婚姻当成女性人生的默认结局",
    ],
    reviewer: "待内容负责人会签",
    date: "2026-11-04",
  },
});

export type ChenYingzhenStory = typeof chenYingzhenStory;
