// Client-side API proxy calling the full-stack server
export async function askAiTutor(message: string, history: { role: string; content: string }[] = []) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message, history })
    });
    const result = await response.json();
    if (result.success) {
      return result.text;
    }
    return result.error || "通信链路暂时中断，请稍后再试。";
  } catch (error) {
    console.error("AI Tutor Client Error:", error);
    return "系统故障：连接控制塔台失败，请稍后重试。";
  }
}

export async function getRealtimeIndustryStats() {
  try {
    const response = await fetch("/api/stats");
    const result = await response.json();
    if (result.success) {
      return result;
    }
    return {
      success: false,
      error: result.error || "无法获取实时低空经济统计指标"
    };
  } catch (error) {
    console.error("Failed to fetch statistics from backend.", error);
    return {
      success: false,
      error: String(error)
    };
  }
}
