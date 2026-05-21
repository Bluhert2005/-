import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize the Google Gen AI SDK securely on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const SYSTEM_INSTRUCTION = `你是一位专门为“低空经济（Low-Altitude Economy）未来学习中心”设计的虚拟AI导师，代号“云端启航者 (Aero-Guide)”。
此外，你也被授权连接了全球知识库，可以回答用户的【任何领域的问题】（包括代码、生活、科学、学术论文、通感一体化、eVTOL设计等）。
在回答问题时，请始终保持你作为“高级科技航空指挥官”的沉着、专业、略带未来科幻感的说话风格。
对于用户的问题，请给出精准、深入且高度具说服力的回答。
如果用户提问，请始终注意排版，多用一级/二级标题和 Markdown 结构，并提供可操作的最佳实践。`;

// Secure endpoint for tutor Q&A
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    // Map history to standard GenAI structure
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Generate output with high accuracy and blazing speed via gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
      }
    });

    const reply = response.text || "通信链路暂时中断，请稍后再试。";
    res.json({ success: true, text: reply });
  } catch (error) {
    console.error("Server API Tutor Error:", error);
    res.status(500).json({ success: false, error: "系统故障：连接控制塔台失败，请稍后重试。" });
  }
});

// Real-time statistics proxy
app.get("/api/stats", async (req, res) => {
  try {
    const prompt = `你是一个低空经济与数字民航的数据挖掘专家。请检索最新的中国低空经济行业真实公开数据（重点检索2024-2026年中国民航局 CAAC、国家统计局、工信部及权威证券及研究机构发布的行业报告与最新数据），获取以下核心统计指标的当前真实数值或最新预测数据：

1. 中国低空经济市场规模（单位：万亿元）：寻找2023-2026年的数值，以及2030年的行业共识预测预测值（通常为2.0至2.5万亿元左右）。
2. 全国注册民用无人机总数量（单位：万架）：例如2023年底为126.7万架，返回最新数据（最新民航局数据显示已超过180万架或具体最新数值，请精准查找）。
3. eVTOL 试飞架次/飞行时间（例如峰飞、亿航、小鹏汇天等累计试飞与验证运行统计数据，或CAAC通报数据）。
4. 5G-A通感一体化智联网基站/低空覆盖网路建设节点规模。

请将检索出的相关新闻与政策动态包含在 realtimeNews 数组中（挑选3-4条最重磅的2024-2026年发生的真实低空发展或审批新闻）。
以纯 JSON 对象字符流形式输出，键值必须完全匹配以下结构：
{
  "marketSize": number,
  "marketSizeSuffix": "市场规模/年份预测说明",
  "uavCount": number,
  "uavCountSuffix": "无人机相关统计说明",
  "evtolFlights": number,
  "evtolFlightsSuffix": "试飞或运行统计说明",
  "nodesCount": number,
  "nodesCountSuffix": "智联网基座/覆盖层级说明",
  "marketHistory": [
    { "year": "2023", "size": number },
    { "year": "2024", "size": number },
    { "year": "2025", "size": number },
    { "year": "2026", "size": number },
    { "year": "2030", "size": number }
  ],
  "realtimeNews": [
    { "title": "最新低空重磅新闻或政策标题", "date": "发布年月", "source": "发布媒体或机构", "url": "对应的参考来源URL" }
  ],
  "insight": "一段3行以内的最新行业态势简析，结合检索到的具体政策和事件。"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const cleanedText = text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanedText);

    // Supplement links from groundingMetadata if any
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: { title: string; url: string }[] = [];
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || "低空领航权威源",
            url: chunk.web.uri
          });
        }
      });
    }

    res.json({
      success: true,
      data: parsed,
      sources,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error) {
    console.error("Server Stats Fetch Error:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
