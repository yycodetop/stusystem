// ==========================================
// 模块名称：用户个人资料编辑 (Feature User Profile)
// 版本：V1.1 (资产展示优化版)
// 更新内容：
// 1. [UI] 移除了头像下方的等级和ID显示。
// 2. [UI] 新增了全维度的资产数据网格（积分/天梯/活跃/荣誉/码豆/星耀数据）。
// 3. [UI] 保持了原有的编辑和头像更换功能。
// ==========================================

const UserProfileFeature = {
    props: ['user'],
    emits: ['close', 'update-user', 'show-toast'],
    
    template: `
    <div class="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all" @click.self="closeModal">
        
        <div class="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col md:flex-row max-h-[90vh]">
            
            <!-- 左侧：头像与核心数据区 -->
            <div class="w-full md:w-80 bg-slate-50 border-r border-slate-100 flex flex-col items-center p-8 relative overflow-hidden shrink-0 custom-scrollbar overflow-y-auto">
                <!-- 背景装饰 -->
                <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 to-violet-600"></div>
                <div class="absolute top-24 left-1/2 -translate-x-1/2 w-32 h-32 bg-slate-50 rounded-full"></div>

                <!-- 头像交互区 -->
                <div class="relative group cursor-pointer z-10 mb-2" @click="showAvatarSelector = true">
                    <div class="size-28 rounded-full border-4 border-white shadow-xl overflow-hidden relative bg-white">
                        <img :src="formData.avatar" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">
                        <!-- 悬浮遮罩 -->
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                            <i class="fa-solid fa-camera text-2xl mb-1"></i>
                            <span class="text-[10px] font-bold">更换头像</span>
                        </div>
                    </div>
                    <div class="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-sm border border-slate-100 text-indigo-500 text-xs hover:text-indigo-600">
                        <i class="fa-solid fa-pen"></i>
                    </div>
                </div>

                <!-- 姓名 (移除等级和ID) -->
                <div class="text-center z-10 mb-8">
                    <h2 class="text-2xl font-black text-slate-800 tracking-tight">{{ user.name }}</h2>
                </div>

                <!-- 全维度资产网格 (4行2列) -->
                <div class="grid grid-cols-2 gap-3 w-full z-10">
                    
                    <!-- 1. 积分 -->
                    <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-sm flex flex-col items-center justify-center group hover:border-blue-200 transition">
                        <div class="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1 group-hover:text-blue-500"><i class="fa-solid fa-gem text-blue-400"></i> 积分</div>
                        <div class="font-mono font-bold text-slate-700 text-sm">{{ formatNumber(user.currencies['积分']) }}</div>
                    </div>

                    <!-- 2. 天梯币 -->
                    <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-sm flex flex-col items-center justify-center group hover:border-amber-200 transition">
                        <div class="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1 group-hover:text-amber-500"><i class="fa-solid fa-trophy text-amber-400"></i> 天梯币</div>
                        <div class="font-mono font-bold text-slate-700 text-sm">{{ formatNumber(user.currencies['天梯币']) }}</div>
                    </div>

                    <!-- 3. 活跃度 -->
                    <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-sm flex flex-col items-center justify-center group hover:border-rose-200 transition">
                        <div class="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1 group-hover:text-rose-500"><i class="fa-solid fa-fire text-rose-400"></i> 活跃度</div>
                        <div class="font-mono font-bold text-slate-700 text-sm">{{ formatNumber(user.currencies['活跃点']) }}</div>
                    </div>

                    <!-- 4. 荣誉点 -->
                    <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-sm flex flex-col items-center justify-center group hover:border-purple-200 transition">
                        <div class="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1 group-hover:text-purple-500"><i class="fa-solid fa-medal text-purple-400"></i> 荣誉点</div>
                        <div class="font-mono font-bold text-slate-700 text-sm">{{ formatNumber(user.currencies['荣誉点']) }}</div>
                    </div>

                    <!-- 5. 码豆 -->
                    <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-sm flex flex-col items-center justify-center group hover:border-emerald-200 transition">
                        <div class="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1 group-hover:text-emerald-500"><i class="fa-solid fa-seedling text-emerald-400"></i> 码豆</div>
                        <div class="font-mono font-bold text-slate-700 text-sm">{{ formatNumber(user.currencies['码豆']) }}</div>
                    </div>

                    <!-- 6. 星耀分 (Mocked/Derived) -->
                    <div class="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl border border-transparent text-center shadow-md flex flex-col items-center justify-center text-white">
                        <div class="text-[10px] text-indigo-100 mb-0.5 flex items-center gap-1"><i class="fa-solid fa-star text-yellow-300"></i> 星耀分</div>
                        <div class="font-mono font-bold text-sm">1,850</div>
                    </div>

                    <!-- 7. 星耀排名 (Mocked/Derived) -->
                    <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-sm flex flex-col items-center justify-center group hover:border-indigo-200 transition">
                        <div class="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1 group-hover:text-indigo-500"><i class="fa-solid fa-ranking-star text-indigo-400"></i> 排名</div>
                        <div class="font-mono font-bold text-slate-700 text-sm">No. 12</div>
                    </div>

                    <!-- 8. 加入时间 -->
                    <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-center shadow-sm flex flex-col items-center justify-center group hover:border-slate-300 transition">
                        <div class="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1"><i class="fa-regular fa-calendar text-slate-400"></i> 加入时间</div>
                        <div class="font-mono font-bold text-slate-700 text-sm">842天</div>
                    </div>

                </div>
            </div>

            <!-- 右侧：详细资料表单 -->
            <div class="flex-1 flex flex-col bg-white overflow-hidden">
                <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-user-gear text-indigo-500"></i> 编辑个人资料
                    </h3>
                    <button @click="closeModal" class="text-slate-400 hover:text-slate-600 transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                </div>

                <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form @submit.prevent="saveProfile" class="space-y-6">
                        
                        <!-- 不可修改区域 -->
                        <div class="bg-slate-50 rounded-xl p-5 border border-slate-100">
                            <div class="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <i class="fa-solid fa-lock"></i> 基础身份信息 (不可修改)
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1.5">姓名</label>
                                    <div class="w-full bg-slate-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-slate-500 font-medium cursor-not-allowed">
                                        {{ user.name }}
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1.5">手机号码</label>
                                    <div class="w-full bg-slate-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-slate-500 font-medium cursor-not-allowed flex justify-between items-center">
                                        <span>{{ formatPhone(user.phone) }}</span>
                                        <i class="fa-solid fa-shield-halved text-green-500 text-xs" title="已验证"></i>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1.5">出生日期</label>
                                    <div class="w-full bg-slate-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-slate-500 font-medium cursor-not-allowed">
                                        {{ user.birthday || '2013-05-20' }}
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1.5">电子邮箱</label>
                                    <div class="w-full bg-slate-100 border border-transparent rounded-lg px-3 py-2.5 text-sm text-slate-500 font-medium cursor-not-allowed">
                                        {{ user.email || 'student@example.com' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 可编辑区域 -->
                        <div>
                            <div class="flex items-center gap-2 mb-4 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                                <i class="fa-solid fa-pen-to-square"></i> 拓展信息设置
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1.5">性别</label>
                                    <select v-model="formData.gender" class="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none transition">
                                        <option value="male">男</option>
                                        <option value="female">女</option>
                                        <option value="secret">保密</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1.5">所在年级</label>
                                    <select v-model="formData.grade" class="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none transition">
                                        <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
                                    </select>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-xs font-bold text-slate-700 mb-1.5">就读学校</label>
                                    <div class="relative">
                                        <i class="fa-solid fa-school absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                        <input v-model="formData.school" type="text" class="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-700 outline-none transition" placeholder="请输入学校全称">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1.5">所在省份</label>
                                    <input v-model="formData.province" type="text" class="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none transition" placeholder="如：北京市">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1.5">所在城市</label>
                                    <input v-model="formData.city" type="text" class="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none transition" placeholder="如：海淀区">
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-xs font-bold text-slate-700 mb-1.5">家庭详细地址</label>
                                    <textarea v-model="formData.address" rows="2" class="w-full bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none transition resize-none" placeholder="请输入街道、小区、楼栋号等信息"></textarea>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div class="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                    <button @click="closeModal" class="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white hover:border-slate-300 transition">取消</button>
                    <button @click="saveProfile" class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition flex items-center gap-2">
                        <i class="fa-solid fa-floppy-disk"></i> 保存修改
                    </button>
                </div>
            </div>
        </div>

        <!-- 子弹窗：头像选择器 -->
        <transition name="fade">
            <div v-if="showAvatarSelector" class="absolute inset-0 z-[410] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
                <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-scale-in overflow-hidden border border-slate-200">
                    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 class="font-bold text-slate-800">更换头像</h3>
                        <button @click="showAvatarSelector = false" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    
                    <div class="p-6">
                        <div class="flex gap-4 mb-6 border-b border-slate-100">
                            <button @click="avatarTab = 'system'" class="pb-2 text-sm font-bold border-b-2 transition" :class="avatarTab === 'system' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'">系统头像</button>
                            <button @click="avatarTab = 'custom'" class="pb-2 text-sm font-bold border-b-2 transition" :class="avatarTab === 'custom' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'">自定义上传</button>
                        </div>

                        <!-- 系统头像列表 -->
                        <div v-if="avatarTab === 'system'" class="grid grid-cols-4 sm:grid-cols-5 gap-4 max-h-64 overflow-y-auto custom-scrollbar p-1">
                            <div v-for="(avt, idx) in systemAvatars" :key="idx" 
                                 @click="selectSystemAvatar(avt)"
                                 class="aspect-square rounded-full border-2 cursor-pointer relative group overflow-hidden transition-all"
                                 :class="formData.avatar === avt ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-slate-300'">
                                <img :src="avt" class="w-full h-full object-cover">
                                <div v-if="formData.avatar === avt" class="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                                    <i class="fa-solid fa-check text-white drop-shadow-md"></i>
                                </div>
                            </div>
                        </div>

                        <!-- 自定义上传 -->
                        <div v-else class="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative" @click="triggerFileUpload">
                            <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload">
                            <div v-if="customAvatarPreview" class="relative group size-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md">
                                <img :src="customAvatarPreview" class="w-full h-full object-cover">
                                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">重新选择</div>
                            </div>
                            <div v-else class="size-16 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center text-2xl mb-4">
                                <i class="fa-solid fa-cloud-arrow-up"></i>
                            </div>
                            <p class="text-sm font-bold text-slate-600">{{ customAvatarPreview ? '点击更换图片' : '点击上传图片' }}</p>
                            <p class="text-xs text-slate-400 mt-1">支持 JPG, PNG, GIF (最大 2MB)</p>
                        </div>
                    </div>

                    <div class="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                        <button @click="showAvatarSelector = false" class="px-4 py-2 rounded-lg text-slate-500 text-xs font-bold hover:bg-white border border-transparent hover:border-slate-200 transition">取消</button>
                        <button @click="confirmAvatar" class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition">确定更换</button>
                    </div>
                </div>
            </div>
        </transition>

    </div>
    `,
    
    setup(props, { emit }) {
        const { ref, reactive, watch } = Vue;

        const formData = reactive({
            gender: 'secret',
            grade: '',
            school: '',
            province: '',
            city: '',
            address: '',
            avatar: ''
        });

        const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'];
        
        const showAvatarSelector = ref(false);
        const avatarTab = ref('system');
        const fileInput = ref(null);
        const customAvatarPreview = ref(null);
        const tempSelectedAvatar = ref('');

        // 预设系统头像
        const systemAvatars = [
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Callie',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Willow',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Emery',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Kitty',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
            'https://api.dicebear.com/7.x/avataaars/svg?seed=Sorelle'
        ];

        // 初始化数据
        watch(() => props.user, (newVal) => {
            if (newVal) {
                formData.gender = newVal.gender || 'secret';
                formData.grade = newVal.grade || '';
                formData.school = newVal.school || '';
                formData.province = newVal.province || '';
                formData.city = newVal.city || '';
                formData.address = newVal.address || '';
                formData.avatar = newVal.avatar;
                tempSelectedAvatar.value = newVal.avatar;
            }
        }, { immediate: true, deep: true });

        const formatPhone = (phone) => {
            return phone ? phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未绑定';
        };

        const formatNumber = (num) => {
            return num ? num.toLocaleString() : '0';
        };

        const closeModal = () => {
            emit('close');
        };

        const saveProfile = () => {
            if (formData.address && formData.address.length > 50) {
                emit('show-toast', '地址过长，请精简', 'warning');
                return;
            }
            emit('update-user', { ...formData });
            emit('show-toast', '资料保存成功', 'success');
            emit('close');
        };

        // 头像相关逻辑
        const selectSystemAvatar = (url) => {
            tempSelectedAvatar.value = url;
            customAvatarPreview.value = null; 
        };

        const triggerFileUpload = () => {
            fileInput.value.click();
        };

        const handleFileUpload = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    emit('show-toast', '图片大小不能超过 2MB', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    customAvatarPreview.value = e.target.result;
                    tempSelectedAvatar.value = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };

        const confirmAvatar = () => {
            formData.avatar = tempSelectedAvatar.value;
            showAvatarSelector.value = false;
        };

        return {
            formData, grades,
            showAvatarSelector, avatarTab, systemAvatars, fileInput, customAvatarPreview,
            formatPhone, formatNumber, closeModal, saveProfile,
            selectSystemAvatar, triggerFileUpload, handleFileUpload, confirmAvatar
        };
    }
};

window.UserProfileFeature = UserProfileFeature;