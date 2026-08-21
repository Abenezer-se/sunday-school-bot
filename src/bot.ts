import express from "express";
import { Telegraf, Markup, session } from "telegraf";
import type { Context } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

interface SessionData {
  step?: string;
  memberStatus?: string;
  informationType?: string;
  mourningName?: string;
  celebrationType?: string;
  celebrationInformation?: string;
  currentInformation?: string;
  question?: string;
  situation?: string;
  advicePhone?: string;
}

interface BotContext extends Context {
  session: SessionData;
}

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;

if (!botToken) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing from .env");
}

if (!adminChatId) {
  throw new Error("ADMIN_CHAT_ID is missing from .env");
}

const bot = new Telegraf<BotContext>(botToken);

bot.use(session({ defaultSession: () => ({}) }));

bot.start(async (ctx) => {
  ctx.session = {
    step: "member_status",
  };

  await ctx.reply(
    "እንኳን ወደ ደብረ ሰላም መድኃኔዓለም ካቴድራል የመሠረተ ሕይወት ሰንበት ትምህርት ቤት መረጃ መስጫ ቦት በደህና መጡ!\n\n" +
      "የሰንበት ትምህርት ቤቱ አባል ነዎት?",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("አዎ ነኝ", "member_yes"),
        Markup.button.callback("አይ አይደለሁም", "member_no"),
      ],
    ])
  );
});

bot.action("member_yes", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.memberStatus = "አዎ ነኝ";
  ctx.session.step = "information_type";
  await showInformationTypes(ctx);
});

bot.action("member_no", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.memberStatus = "አይ አይደለሁም";
  ctx.session.step = "information_type";
  await showInformationTypes(ctx);
});

async function showInformationTypes(ctx: BotContext) {
  await ctx.reply(
    "ምን ዓይነት መረጃ መስጠት ይፈልጋሉ?",
    Markup.inlineKeyboard([
      [Markup.button.callback("የሐዘን / የእዘን", "mourning")],
      [Markup.button.callback("የደስታ", "celebration")],
      [Markup.button.callback("ወቅታዊ", "current")],
      [Markup.button.callback("ትምህርታዊ ጥያቄዎችን ለመጠየቅ", "education")],
      [Markup.button.callback("ምክር ለመቀበል", "advice")],
    ])
  );
}

bot.action("mourning", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "የሐዘን / የእዘን";
  ctx.session.step = "mourning_name";
  await ctx.reply("እባክዎን ሐዘን ያጋጠመውን የሰንበት ትምህርት ቤቱን አባል ሙሉ ስም ይጻፉ።");
});

bot.action("celebration", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "የደስታ";
  ctx.session.step = "celebration_type";
  await ctx.reply(
    "እባክዎን የደስታ ዓይነት ይምረጡ፦",
    Markup.inlineKeyboard([
      [Markup.button.callback("ሰርግ ለማሳወቅ", "wedding")],
      [Markup.button.callback("ምርቃት ለማሳወቅ", "graduation")],
      [Markup.button.callback("ወሰብአይ", "wesebai")],
      [Markup.button.callback("ሌሎች የደስታ መርሃ-ግብሮችን ለማሳወቅ", "other_celebration")],
    ])
  );
});

bot.action("wedding", async (ctx) => {
  await startCelebration(ctx, "ሰርግ");
});

bot.action("graduation", async (ctx) => {
  await startCelebration(ctx, "ምርቃት");
});

bot.action("wesebai", async (ctx) => {
  await startCelebration(ctx, "ወሰብአይ");
});

bot.action("other_celebration", async (ctx) => {
  await startCelebration(ctx, "ሌሎች የደስታ መርሃ-ግብር");
});

async function startCelebration(ctx: BotContext, type: string) {
  await ctx.answerCbQuery();
  ctx.session.celebrationType = type;
  ctx.session.step = "celebration_information";
  await ctx.reply(
    `እባክዎን የ${type} ያለበትን የሰንበት ትምህርት ቤቱን አባል ሙሉ ስም፣ ስልክ ቁጥር እና የመርሃ-ግብሩን ሰዓት እና ቦታ ይጻፉ።`
  );
}

bot.action("current", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "ወቅታዊ";
  ctx.session.step = "current_information";
  await ctx.reply("እባክዎን ማሳወቅ የሚፈልጉትን ወቅታዊ መረጃ ያስገቡ።");
});

bot.action("education", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "ትምህርታዊ ጥያቄ";
  ctx.session.step = "education_question";
  await ctx.reply("እባክዎን ጥያቄዎን ያስገቡ።");
});

bot.action("advice", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.session.informationType = "ምክር ለመቀበል";
  ctx.session.step = "advice_situation";
  await ctx.reply("እባክዎን ያጋጠመዎትን ሁኔታ ያሳውቁ።");
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim();
  const step = ctx.session.step;

  if (step === "mourning_name") {
    ctx.session.mourningName = text;
    await sendToAdmin(ctx, "የሐዘን / የእዘን መረጃ", `የአባሉ ሙሉ ስም፦ ${text}`);
    await finish(ctx);
    return;
  }

  if (step === "celebration_information") {
    ctx.session.celebrationInformation = text;
    ctx.session.step = "celebration_additional";
    await ctx.reply("ማሳወቅ የሚፈልጉትን ተጨማሪ መረጃ ያስገቡ።\n\nከሌለ «የለም» ይበሉ።");
    return;
  }

  if (step === "celebration_additional") {
    await sendToAdmin(
      ctx,
      "የደስታ መረጃ",
      `የደስታ ዓይነት፦ ${ctx.session.celebrationType}\n\n` +
        `የአባሉ መረጃ፦ ${ctx.session.celebrationInformation}\n\n` +
        `ተጨማሪ መረጃ፦ ${text}`
    );
    await finish(ctx);
    return;
  }

  if (step === "current_information") {
    ctx.session.currentInformation = text;
    await sendToAdmin(ctx, "ወቅታዊ መረጃ", text);
    await finish(ctx);
    return;
  }

  if (step === "education_question") {
    ctx.session.question = text;
    await sendToAdmin(ctx, "ትምህርታዊ ጥያቄ", text);
    await ctx.reply(
      "ጥያቄዎን ስለላኩልን እናመሰግናለን!\n\nምላሹን በጥቂት ቀናት ውስጥ እናሳውቆታለን።"
    );
    ctx.session = {};
    return;
  }

  if (step === "advice_situation") {
    ctx.session.situation = text;
    ctx.session.step = "advice_phone";
    await ctx.reply("እባክዎን ስልክ ቁጥርዎን ያስገቡ።");
    return;
  }

  if (step === "advice_phone") {
    ctx.session.advicePhone = text;
    await sendToAdmin(
      ctx,
      "ምክር ለመቀበል",
      `ያጋጠመው ሁኔታ፦ ${ctx.session.situation}\n\nስልክ ቁጥር፦ ${text}`
    );
    await ctx.reply(
      "መረጃውን ስላስገቡ እናመሰግናለን!\n\nበጥቂት ቀናት ውስጥ ለምክር አባው ወይም ከሰንበት ትምህርት ቤቱ የሰው ሀብት ክፍል ሥነ-ምግባር ዘርፍ ጋር እናገናኝዎታለን።"
    );
    ctx.session = {};
    return;
  }

  if (!step) {
    await ctx.reply("እባክዎን /start በመጫን ውይይቱን ይጀምሩ።");
  }
});

async function sendToAdmin(ctx: BotContext, title: string, details: string) {
  const username = ctx.from?.username ? `@${ctx.from.username}` : "የለም";
  const firstName = ctx.from?.first_name || "የለም";
  const lastName = ctx.from?.last_name || "";

  const adminMessage =
    `🔔 አዲስ መረጃ\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `📌 የመረጃ ዓይነት፦ ${title}\n\n` +
    `${details}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 የላኪው ስም፦ ${firstName} ${lastName}\n` +
    `📱 Telegram Username፦ ${username}\n` +
    `🆔 Telegram ID፦ ${ctx.from?.id}\n` +
    `👥 የአባልነት ሁኔታ፦ ${ctx.session.memberStatus}`;

  try {
    await ctx.telegram.sendMessage(adminChatId as string, adminMessage);
    console.log("✅ Sent to admin group successfully.");
  } catch (err) {
    console.error("❌ FAILED to send to admin group:", err);
  }
}

async function finish(ctx: BotContext) {
  if (ctx.session.memberStatus === "አዎ ነኝ") {
    await ctx.reply("መረጃውን ስላሳወቁን እናመሰግናለን!");
  } else {
    await ctx.reply("እንደ ሰንበት ትምህርት ቤቱ አባል ባይሆኑም መረጃውን ስላሰጡን እናመሰግናለን!");
  }
  ctx.session = {};
}

bot.catch((error) => {
  console.error("Bot error:", error);
});

const app = express();
const port = Number(process.env.PORT) || 3000;
const domain = process.env.RENDER_EXTERNAL_URL;

if (!domain) {
  throw new Error(
    "RENDER_EXTERNAL_URL is missing — this only gets set automatically when running on Render."
  );
}

app.use(await bot.createWebhook({ domain }));

app.get("/", (_req, res) => {
  res.send("Bot is running.");
});

app.listen(port, () => {
  console.log(`🤖 የመሠረተ ሕይወት መረጃ መስጫ ቦት እየሰራ ነው... (webhook mode, port ${port})`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));