// ==========================================
// 模块名称：微信绑定向导 (Feature Wechat Bind)
// 版本：V1.0
// 描述：分步完成手机号验证与微信扫码绑定
// ==========================================

const WechatBindFeature = {
    props: ['user'],
    emits: ['close', 'show-toast'],
    
    template: `
    <div class="fixed inset-0 z-[450] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all" @click.self="closeModal">
        
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col relative">
            
            <!-- 关闭按钮 -->
            <button @click="closeModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition z-10">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>

            <!-- 顶部进度条 -->
            <div class="h-1.5 w-full bg-slate-100">
                <div class="h-full bg-green-500 transition-all duration-500" :style="{width: step === 1 ? '33%' : (step === 2 ? '66%' : '100%')}"></div>
            </div>

            <!-- 内容区 -->
            <div class="p-8">
                
                <!-- 标题 -->
                <div class="text-center mb-8">
                    <div class="size-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                        <i class="fa-brands fa-weixin"></i>
                    </div>
                    <h2 class="text-xl font-black text-slate-800">绑定微信账号</h2>
                    <p class="text-xs text-slate-400 mt-1">绑定后可接收上课提醒和作业通知</p>
                </div>

                <!-- Step 1: 基础信息填写 -->
                <div v-if="step === 1" class="space-y-4 animate-fade-in">
                    <!-- 手机号 -->
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5 ml-1">手机号码</label>
                        <div class="relative">
                            <i class="fa-solid fa-mobile-screen absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                            <input v-model="form.phone" type="text" placeholder="请输入家长手机号" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition" maxlength="11">
                        </div>
                    </div>

                    <!-- 图片验证码 -->
                    <div class="flex gap-3">
                        <div class="flex-1">
                            <input v-model="form.imgCode" type="text" placeholder="图片验证码" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition">
                        </div>
                        <div class="w-24 h-[42px] bg-slate-200 rounded-xl cursor-pointer overflow-hidden flex items-center justify-center select-none" @click="refreshCaptcha" title="点击刷新">
                            <!-- 模拟验证码图片 -->
                            <div class="text-slate-500 font-mono font-bold tracking-widest text-lg italic" :style="{transform: 'rotate(' + (Math.random()*10-5) + 'deg)'}">{{ captchaCode }}</div>
                        </div>
                    </div>

                    <!-- 短信验证码 -->
                    <div class="flex gap-3">
                        <div class="flex-1">
                            <input v-model="form.smsCode" type="text" placeholder="短信验证码" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition">
                        </div>
                        <button @click="sendSms" :disabled="smsTimer > 0" class="w-28 bg-white border border-slate-200 text-slate-600 hover:text-green-600 hover:border-green-200 text-xs font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
                            {{ smsTimer > 0 ? smsTimer + 's后重发' : '获取验证码' }}
                        </button>
                    </div>

                    <!-- 绑定关系 -->
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5 ml-1">绑定关系</label>
                        <div class="grid grid-cols-4 gap-2">
                            <button v-for="rel in relations" :key="rel" 
                                    @click="form.relation = rel"
                                    class="py-2 rounded-lg text-xs font-bold border transition"
                                    :class="form.relation === rel ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'">
                                {{ rel }}
                            </button>
                        </div>
                    </div>

                    <button @click="nextStep" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 transition mt-2 active:scale-95">
                        下一步
                    </button>
                </div>

                <!-- Step 2: 扫码绑定 -->
                <div v-else-if="step === 2" class="flex flex-col items-center animate-fade-in text-center">
                    <div class="bg-white p-2 rounded-xl border border-slate-100 shadow-sm mb-4 relative group">
                        <!-- 模拟二维码 -->
                        <div class="size-48 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 relative overflow-hidden">
                            <i class="fa-solid fa-qrcode text-8xl opacity-20"></i>
                            <!-- 扫描光效 -->
                            <div class="absolute top-0 left-0 w-full h-1 bg-green-500/50 shadow-[0_0_10px_#22c55e] animate-scan"></div>
                        </div>
                        
                        <!-- 模拟扫码成功遮罩 -->
                        <div v-if="isScanning" class="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-lg z-10">
                            <i class="fa-solid fa-circle-check text-4xl text-green-500 mb-2 animate-bounce"></i>
                            <span class="text-sm font-bold text-slate-700">扫码成功！</span>
                        </div>
                    </div>

                    <p class="text-sm text-slate-600 font-bold mb-1">请使用微信“扫一扫”</p>
                    <p class="text-xs text-slate-400 mb-6">扫描上方二维码完成最终绑定</p>

                    <div class="flex gap-3 w-full">
                        <button @click="step = 1" class="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold py-2.5 rounded-xl text-sm transition">
                            上一步
                        </button>
                        <!-- 模拟扫码完成按钮（实际场景通常是后端推送） -->
                        <button @click="simulateScan" class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-green-200 transition">
                            <span v-if="!isScanning">我已扫码</span>
                            <span v-else><i class="fa-solid fa-spinner fa-spin"></i> 处理中...</span>
                        </button>
                    </div>
                </div>

                <!-- Step 3: 完成 -->
                <div v-else-if="step === 3" class="flex flex-col items-center animate-scale-in text-center py-4">
                    <div class="size-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg shadow-green-100 animate-pulse">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <h3 class="text-2xl font-black text-slate-800 mb-2">绑定成功！</h3>
                    <p class="text-sm text-slate-500 mb-8 max-w-[200px]">
                        您的微信 <span class="font-bold text-slate-700">DoneDone</span> 已成功绑定学员账号。
                    </p>
                    <button @click="closeModal" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-xl transition active:scale-95">
                        完成
                    </button>
                </div>

            </div>
        </div>

        <component :is="'style'">
            @keyframes scan {
                0% { top: 0; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
            }
            .animate-scan {
                animation: scan 2s linear infinite;
            }
        </component>
    </div>
    `,
    
    setup(props, { emit }) {
        const { ref, reactive, onUnmounted } = Vue;

        const step = ref(1);
        const smsTimer = ref(0);
        const captchaCode = ref('A7d3'); // 模拟验证码
        const isScanning = ref(false);
        let timerInterval = null;

        const form = reactive({
            phone: props.user?.phone || '',
            imgCode: '',
            smsCode: '',
            relation: '自己'
        });

        const relations = ['自己', '父亲', '母亲', '其他'];

        // 刷新验证码
        const refreshCaptcha = () => {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let result = '';
            for (let i = 0; i < 4; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            captchaCode.value = result;
        };

        // 发送短信
        const sendSms = () => {
            if (!/^1[3-9]\d{9}$/.test(form.phone)) {
                emit('show-toast', '请输入正确的手机号', 'error');
                return;
            }
            if (form.imgCode.toLowerCase() !== captchaCode.value.toLowerCase()) {
                emit('show-toast', '图片验证码错误', 'error');
                refreshCaptcha();
                return;
            }

            emit('show-toast', '验证码已发送: 1234', 'success'); // 模拟
            smsTimer.value = 60;
            timerInterval = setInterval(() => {
                smsTimer.value--;
                if (smsTimer.value <= 0) clearInterval(timerInterval);
            }, 1000);
        };

        // 下一步
        const nextStep = () => {
            // 简单验证
            if (!form.phone || !form.smsCode) {
                emit('show-toast', '请完善信息', 'warning');
                return;
            }
            if (form.smsCode !== '1234') { // 模拟验证
                emit('show-toast', '短信验证码错误', 'error');
                return;
            }
            step.value = 2;
        };

        // 模拟扫码
        const simulateScan = () => {
            isScanning.value = true;
            setTimeout(() => {
                step.value = 3;
                emit('show-toast', '微信绑定成功', 'success');
            }, 1500);
        };

        const closeModal = () => {
            emit('close');
        };

        onUnmounted(() => {
            if (timerInterval) clearInterval(timerInterval);
        });

        return {
            step, form, relations, smsTimer, captchaCode, isScanning,
            refreshCaptcha, sendSms, nextStep, simulateScan, closeModal
        };
    }
};

window.WechatBindFeature = WechatBindFeature;