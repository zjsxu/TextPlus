/* =========================================
   main.js — 项目入口模块
   ========================================= */

/* 全局词典 */
let FUNCTION_WORD_DICT = {};
let CUSTOM_WORD_MAP = JSON.parse(localStorage.getItem("CUSTOM_WORD_MAP") || "{}");

/* 保存 custom-map */
function saveCustomWordMap() {
    localStorage.setItem("CUSTOM_WORD_MAP", JSON.stringify(CUSTOM_WORD_MAP));
}

/* 将自定义词加入总词典 */
function mergeCustomWordsIntoDict() {
    for (const [word, cat] of Object.entries(CUSTOM_WORD_MAP)) {
        FUNCTION_WORD_DICT[word] = cat;
    }
}

/* 加载后端词典 */
function loadFunctionWordDict() {
    return fetch("http://127.0.0.1:5000/get-dict")
        .then(r => r.json())
        .then(data => {
            FUNCTION_WORD_DICT = data;
            mergeCustomWordsIntoDict();
            console.log("词典已加载：", FUNCTION_WORD_DICT);
        });
}

/* =========================================
   文件上传 + 文本提取（调用后端 /extract-text）
   ========================================= */
function uploadFile(target) {
    const fileInput = document.getElementById(`file${target}`);
    const file = fileInput.files[0];
    const textarea = document.getElementById(`text${target}`);
    
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    textarea.value = `正在上传并提取文件 [${file.name}] 中的文本，请稍候...`;

    fetch('http://127.0.0.1:5000/extract-text', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`服务器响应失败，状态码: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            textarea.value = `提取失败: ${data.error}`;
        } else {
            textarea.value = data.text;
        }
    })
    .catch(error => {
        console.error('上传或连接错误:', error);
        textarea.value = `连接服务器失败，请确保后端程序 (server.py) 已运行。错误: ${error.message}`;
    });
}

/* 页面初始动作 */
window.addEventListener("DOMContentLoaded", () => {
    console.log("系统初始化中……");

    // 加载词典
    loadFunctionWordDict().then(() => {
        if (typeof renderFunctionWordDict === "function") {
            renderFunctionWordDict();
        }
    });

    // 主题加载
    const mode = localStorage.getItem("themeMode") || "default";
    applyTheme(mode);

    // 绑定对比按钮
    const btn = document.getElementById("compareBtn");
    if (btn) btn.addEventListener("click", compareTexts);

    // 词频分析按钮（如果存在）
    const freqBtn = document.getElementById("freqBtn");
    if (freqBtn) freqBtn.addEventListener("click", runFrequencyAnalysis);

    console.log("初始化完成。");
});