// --- Configuration ---
const WXPUSHER_APP_TOKEN = "AT_MZzFjtFVXG3uu86317qfIIYNpWkJCuhz"; // 替换为你的 WxPusher 应用 Token
const OWNER_UIDS = ["UID_pTg5z7dlhecTi3WSbvrrgI8No0BO"];       // 替换为车主的 UID 数组
const OWNER_PHONE_NUMBER = "tel:15560253474"; // 替换为车主电话号码，格式如 "tel:13812345678"

// --- Utility Functions ---
function getLastNotifyTime() {
    return parseInt(localStorage.getItem('lastNotifyTime') || '0', 10);
}

function setLastNotifyTime(time) {
    localStorage.setItem('lastNotifyTime', time.toString());
}

function canNotify() {
    const lastNotifyTime = getLastNotifyTime();
    const currentTime = Date.now();
    // 限制为每 5 分钟通知一次
    const fiveMinutesAgo = currentTime - 5 * 60 * 1000;
    return lastNotifyTime < fiveMinutesAgo;
}

// --- Custom Modal Functions (replaces alert) ---
function showModal(title, message) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('customModal').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('customModal').classList.add('hidden');
}

// --- Main Logic Functions ---
async function notifyOwner() {
    const notifyButton = document.getElementById('notifyBtn');
    notifyButton.disabled = true; // Disable button to prevent multiple clicks

    if (!canNotify()) {
        const timeLeft = 5 * 60 * 1000 - (Date.now() - getLastNotifyTime());
        const minutes = Math.ceil(timeLeft / (60 * 1000));
        showModal("通知限制", `请等待 ${minutes} 分钟后再次尝试。`);
        notifyButton.disabled = false;
        return;
    }

    try {
        const response = await fetch("https://wxpusher.zjiecode.com/api/send/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                appToken: WXPUSHER_APP_TOKEN,
                content: "您好，有人需要您挪车，请及时处理。",
                contentType: 1, // 1表示纯文本
                uids: OWNER_UIDS
            })
        });
        const data = await response.json();

        if (data.code === 1000) {
            showModal("发送成功", "挪车通知已发送！");
            setLastNotifyTime(Date.now());
        } else {
            showModal("发送失败", `通知发送失败，请稍后重试。错误信息: ${data.msg || '未知错误'}`);
        }
    } catch (error) {
        console.error("Error sending notification:", error);
        showModal("发送出错", "通知发送出错，请检查网络连接或稍后重试。");
    } finally {
        notifyButton.disabled = false; // Re-enable button
    }
}

// 拨打车主电话
function callOwner() {
    if (OWNER_PHONE_NUMBER && OWNER_PHONE_NUMBER !== "tel:00000000000") {
        window.location.href = OWNER_PHONE_NUMBER;
    } else {
        showModal("电话号码缺失", "请先配置正确的车主电话号码。");
    }
}

// --- Event Listeners ---
// 在 DOM 完全加载后添加事件监听器，确保按钮元素已存在
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('notifyBtn').addEventListener('click', notifyOwner);
    document.getElementById('callBtn').addEventListener('click', callOwner);
});
