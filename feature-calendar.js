// ==========================================
// 模块名称：学习日历 (Feature Calendar)
// 版本：V5.8 (布局重构：公共操作区与预约列表)
// 更新内容：
// 1. [UI] 右侧面板重构：顶部新增公共预约操作区（小时/全天），不再受限于当日是否有排班的显隐（无排班时置灰）。
// 2. [UI] 新增“我的预约记录”公共列表，展示所有已预约信息，不再仅显示当天。
// 3. [UI] 值班老师区域移除了“剩余座位数”显示。
// 4. [Logic] 预约列表增加校区名称显示。
// ==========================================

const CalendarFeature = {
    props: ['user'],
    emits: ['show-toast', 'show-modal'],
    
    template: `
    <div class="h-full flex flex-col gap-6 animate-fade-in-up">
        <!-- 顶部 Header -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex justify-between items-center shrink-0">
            <div>
                <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <i class="fa-regular fa-calendar-check text-indigo-500"></i> 教学排班与预约
                </h2>
                <p class="text-slate-500 text-sm mt-1">查看各校区名师排班，灵活安排线下辅导</p>
            </div>
            
            <!-- 校区切换 Tabs -->
            <div class="flex bg-slate-100 p-1 rounded-lg">
                <button v-for="campus in campuses" :key="campus.id"
                        @click="currentCampusId = campus.id"
                        class="px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2"
                        :class="currentCampusId === campus.id ? 'bg-white shadow-sm ' + campus.text : 'text-slate-500 hover:text-slate-700'">
                    <i class="fa-solid fa-school"></i> {{ campus.name }}
                </button>
            </div>
        </div>

        <div class="flex-1 flex gap-6 overflow-hidden">
            <!-- 左侧：日历主体 -->
            <div class="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col overflow-hidden">
                <!-- 日历控制栏 -->
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center gap-4">
                        <button @click="changeMonth(-1)" class="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"><i class="fa-solid fa-chevron-left text-slate-500"></i></button>
                        <h3 class="text-xl font-bold text-slate-800 min-w-[120px] text-center">{{ currentYear }}年 {{ currentMonth + 1 }}月</h3>
                        <button @click="changeMonth(1)" class="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"><i class="fa-solid fa-chevron-right text-slate-500"></i></button>
                    </div>
                    
                    <!-- 图例说明 -->
                    <div class="flex items-center gap-4 text-xs text-slate-500">
                        <div v-for="campus in campuses" :key="campus.id" class="flex items-center gap-1">
                            <div class="size-2 rounded-full" :class="campus.color"></div> 
                            <span>{{ campus.name }}</span>
                        </div>
                        <div class="h-3 w-px bg-slate-200 mx-2"></div>
                        <button @click="resetToToday" class="text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition">回到今天</button>
                    </div>
                </div>

                <!-- 星期栏 -->
                <div class="grid grid-cols-7 mb-2">
                    <div v-for="day in weekDays" :key="day" class="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{{ day }}</div>
                </div>

                <!-- 日期网格 -->
                <div class="grid grid-cols-7 flex-1 auto-rows-fr gap-2 overflow-y-auto custom-scrollbar p-1">
                    <div v-for="n in paddingDays" :key="'pad-'+n"></div>
                    
                    <div v-for="date in daysInMonth" :key="date" 
                         @click="selectDate(date)"
                         class="relative p-2 rounded-xl border transition cursor-pointer flex flex-col items-center justify-center group min-h-[80px]"
                         :class="getDateCellClass(date)">
                        
                        <!-- 预约标记 -->
                        <div v-if="hasMyBooking(date)" class="absolute top-1 right-1 flex h-2 w-2">
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </div>

                        <span class="text-sm font-bold size-8 flex items-center justify-center rounded-full mb-1 transition-colors"
                              :class="isToday(date) ? 'bg-slate-800 text-white' : ''">
                            {{ date }}
                        </span>

                        <!-- 校区排班指示点 -->
                        <div class="flex gap-1 mt-1">
                            <div v-for="campus in campuses" :key="campus.id"
                                 v-show="checkCampusSchedule(campus.id, date)"
                                 class="size-1.5 rounded-full"
                                 :class="campus.color"
                                 :title="campus.name + '有排班'">
                            </div>
                        </div>
                        
                        <!-- 选中校区的时间显示 -->
                        <div v-if="currentSchedule" class="mt-1 h-3">
                             <span v-if="isSelected(date)" class="text-[9px] font-bold text-slate-500 scale-90 origin-top block">
                                {{ currentSchedule.start }}
                            </span>
                        </div>

                    </div>
                </div>
            </div>

            <!-- 右侧：功能与信息面板 -->
            <div class="w-96 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <!-- 详情头部 -->
                <div class="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="text-xs font-bold text-slate-400 uppercase mb-1">{{ getWeekday(selectedDate) }}</div>
                            <div class="text-3xl font-black text-slate-800">{{ formatDateFull(selectedDate) }}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-xs text-slate-400">当前选择</div>
                            <div class="text-sm font-bold" :class="currentCampus.text">{{ currentCampus.name }}</div>
                        </div>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    <!-- 1. 公共操作区：预约 (Always Visible) -->
                    <div class="space-y-3">
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">快速预约</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <!-- 按小时预约 -->
                            <div class="group border border-slate-200 rounded-xl p-3 cursor-pointer transition-all bg-white flex flex-col items-center justify-center gap-2 text-center"
                                 :class="currentSchedule ? 'hover:border-indigo-500 hover:shadow-md' : 'opacity-50 cursor-not-allowed bg-slate-50'"
                                 @click="currentSchedule && openBookingModal('hour')">
                                <div class="size-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-hourglass-half"></i>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-700 text-sm">按小时</div>
                                    <div class="text-[10px] text-slate-400">灵活安排</div>
                                </div>
                            </div>

                            <!-- 按天预约 -->
                            <div class="group border border-slate-200 rounded-xl p-3 cursor-pointer transition-all bg-white flex flex-col items-center justify-center gap-2 text-center"
                                 :class="(currentSchedule && canBookDaily) ? 'hover:border-purple-500 hover:shadow-md' : 'opacity-50 cursor-not-allowed bg-slate-50'"
                                 @click="(currentSchedule && canBookDaily) && openBookingModal('day')">
                                <div class="size-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                                    <i class="fa-solid fa-calendar-day"></i>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-700 text-sm">全天畅学</div>
                                    <div class="text-[10px] text-slate-400">周卡权益</div>
                                </div>
                            </div>
                        </div>
                        <div v-if="!currentSchedule" class="text-[10px] text-red-400 text-center bg-red-50 py-1 rounded">
                            <i class="fa-solid fa-circle-xmark mr-1"></i> 今日该校区无排班，无法预约
                        </div>
                    </div>

                    <!-- 2. 公共区域：我的预约记录列表 -->
                    <div class="border-t border-slate-100 pt-6">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">我的预约记录</h4>
                            <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{{ allBookings.length }}</span>
                        </div>
                        
                        <div v-if="allBookings.length > 0" class="space-y-3">
                            <div v-for="book in allBookings" :key="book.id" 
                                 class="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition group relative overflow-hidden">
                                <!-- 装饰条 -->
                                <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors" 
                                     :class="getCampusColor(book.campusId)"></div>
                                
                                <div class="flex justify-between items-start pl-2">
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="text-xs font-bold text-slate-800">{{ book.date }}</span>
                                            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-100">
                                                {{ getCampusName(book.campusId) }}
                                            </span>
                                        </div>
                                        <div class="text-[10px] text-slate-500 flex items-center gap-1">
                                            <i class="fa-regular fa-clock"></i> {{ book.timeRange }}
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded block mb-1">
                                            {{ book.paymentInfo }}
                                        </span>
                                        <div class="text-[10px] text-green-500 flex items-center justify-end gap-1">
                                            <i class="fa-solid fa-circle-check"></i> 成功
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <p class="text-xs text-slate-400">暂无预约记录</p>
                        </div>
                    </div>

                    <!-- 3. 值班老师信息 (选中日期) -->
                    <div class="border-t border-slate-100 pt-6">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">今日值班 ({{ currentCampus.name }})</span>
                            <span v-if="currentSchedule" class="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">Open</span>
                            <span v-else class="bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">Closed</span>
                        </div>

                        <div v-if="currentSchedule" class="space-y-3">
                            <!-- 老师列表 -->
                            <div v-for="(teacher, idx) in currentCampus.teachers" :key="idx" 
                                 class="flex items-center gap-3 bg-white border border-slate-100 p-2 rounded-xl">
                                <div class="size-10 rounded-full bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center font-bold text-sm text-indigo-600 border border-indigo-100 shadow-sm">
                                    {{ teacher[0] }}
                                </div>
                                <div>
                                    <h4 class="font-bold text-slate-800 text-sm">{{ teacher }}</h4>
                                    <p class="text-[10px] text-slate-400">高级讲师 / 竞赛教练</p>
                                </div>
                            </div>
                            
                            <div class="text-xs text-slate-500 flex items-center gap-2 mt-2 pl-1">
                                <i class="fa-regular fa-clock text-slate-400"></i>
                                值班时间：<span class="font-mono font-bold">{{ currentSchedule.start }} - {{ currentSchedule.end }}</span>
                            </div>
                        </div>
                        <div v-else class="text-center py-4 text-xs text-slate-400 bg-slate-50 rounded-xl">
                            今日无排班
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- 预约配置弹窗 -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="showModal" class="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center" @click.self="closeBookingModal">
                    <div class="bg-white rounded-xl shadow-2xl p-6 w-96 animate-scale-in">
                        <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <i class="fa-solid fa-clipboard-check text-indigo-500"></i>
                            {{ bookingType === 'day' ? '全天预约' : '按小时预约' }}
                        </h3>
                        
                        <!-- 统一信息卡片 -->
                        <div class="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100 flex justify-between items-center shadow-inner">
                            <div>
                                <div class="text-[10px] text-indigo-400 font-bold uppercase mb-1">{{ getWeekday(selectedDate) }}</div>
                                <div class="text-lg font-black text-indigo-900">{{ formatDateFull(selectedDate) }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-[10px] text-indigo-400 font-bold mb-1">值班老师</div>
                                <div class="font-bold text-indigo-700 text-xs">
                                    {{ currentCampus.teachers.join('、') }}
                                </div>
                            </div>
                        </div>
                        
                        <!-- 1. 按天预约确认 -->
                        <div v-if="bookingType === 'day'" class="space-y-4">
                            <div class="bg-slate-50 p-4 rounded-xl text-sm text-slate-600">
                                <p class="flex justify-between mb-2"><span>时间：</span><span class="font-mono font-bold text-indigo-600">08:30 - 16:30</span></p>
                                <p class="flex justify-between"><span>校区：</span><span class="font-bold">{{ currentCampus.name }}</span></p>
                            </div>
                            <div class="text-xs text-slate-500 flex items-start gap-2 bg-orange-50 p-3 rounded-lg text-orange-700 border border-orange-100">
                                <i class="fa-solid fa-circle-info mt-0.5"></i>
                                此模式优先扣除周卡权益。如无周卡将按8小时标准时长扣费。
                            </div>
                        </div>

                        <!-- 2. 按小时预约配置 -->
                        <div v-else class="space-y-6">
                            <div>
                                <label class="text-xs font-bold text-slate-500 mb-1 block">开始时间</label>
                                <input type="time" v-model="formStart" :min="currentSchedule?.start" :max="currentSchedule?.end" 
                                       class="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center transition">
                            </div>
                            
                            <!-- 时长控制器 -->
                            <div>
                                <label class="text-xs font-bold text-slate-500 mb-2 block flex justify-between">
                                    <span>选择时长</span>
                                    <span class="text-indigo-500 font-normal">基础1小时，0.5h递增</span>
                                </label>
                                <div class="flex items-center justify-between bg-slate-50 rounded-xl p-1 border border-slate-200">
                                    <button @click="adjustDuration(-0.5)" 
                                            class="size-10 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                            :disabled="bookingDurationHours <= 1">
                                        <i class="fa-solid fa-minus"></i>
                                    </button>
                                    
                                    <div class="flex flex-col items-center">
                                        <span class="text-xl font-black text-slate-800 font-mono">{{ bookingDurationHours }}</span>
                                        <span class="text-[10px] text-slate-400 font-bold">小时</span>
                                    </div>

                                    <button @click="adjustDuration(0.5)" 
                                            class="size-10 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition flex items-center justify-center shadow-sm">
                                        <i class="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- 自动计算结束时间 -->
                            <div class="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex justify-between items-center text-sm">
                                <span class="text-indigo-800 font-bold">预计结束时间</span>
                                <div class="flex items-center gap-2">
                                    <span class="font-mono font-black text-indigo-600 text-lg">{{ calculatedEndTime }}</span>
                                    <span v-if="isTimeOverSchedule" class="text-[10px] bg-red-100 text-red-600 px-1.5 rounded border border-red-200 animate-pulse">超出排班</span>
                                </div>
                            </div>
                        </div>

                        <!-- 费用计算面板 -->
                        <div class="mt-6 pt-4 border-t border-slate-100">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs font-bold text-slate-500">费用预估</span>
                                <span class="text-xs" :class="costResult.affordable ? 'text-green-500' : 'text-red-500'">
                                    {{ costResult.affordable ? '余额充足' : '余额不足' }}
                                </span>
                            </div>
                            
                            <div class="bg-slate-50 rounded-lg p-3 space-y-1 text-xs">
                                <div v-if="costResult.useWeekCard" class="flex justify-between text-green-600 font-bold">
                                    <span><i class="fa-solid fa-crown mr-1"></i>周卡抵扣</span>
                                    <span>免费</span>
                                </div>
                                <template v-else>
                                    <div v-if="costResult.deductHour > 0" class="flex justify-between text-blue-600">
                                        <span><i class="fa-regular fa-clock mr-1"></i>小时卡</span>
                                        <span>-{{ costResult.deductHour }}h</span>
                                    </div>
                                    <div v-if="costResult.deductBean > 0" class="flex justify-between text-orange-600">
                                        <span><i class="fa-solid fa-coins mr-1"></i>码豆支付</span>
                                        <span>-{{ costResult.deductBean }}</span>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <div class="flex gap-3 mt-6">
                            <button @click="closeBookingModal" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">取消</button>
                            <button @click="confirmBooking" :disabled="!costResult.affordable || duration <= 0 || isTimeOverSchedule"
                                    class="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200">
                                确认预约
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>
    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed, onMounted } = Vue;

        // ================= 1. 基础配置 (更新：多老师/颜色) =================
        const campuses = [
            { id: 'shanshan', name: '杉杉校区', teachers: ['张老师'], color: 'bg-indigo-500', text: 'text-indigo-600' },
            { id: 'tech', name: '科技城校区', teachers: ['沈老师'], color: 'bg-emerald-500', text: 'text-emerald-600' },
            { id: 'nanhu', name: '南湖校区', teachers: ['邹老师', '王老师'], color: 'bg-rose-500', text: 'text-rose-600' }
        ];

        // 模拟各校区的排班规则 (Day of Week: 0-6)
        const CAMPUS_RULES = {
            'shanshan': [1, 2, 3, 4, 5],
            'tech': [2, 4, 6],
            'nanhu': [0, 3, 6]
        };

        const TIME_RULES = {
            weekday: { start: '16:30', end: '20:30' },
            weekend: { start: '08:30', end: '20:30' }
        };

        // ================= 2. 状态管理 =================
        const currentCampusId = ref('nanhu');
        const today = new Date();
        const currentYear = ref(today.getFullYear());
        const currentMonth = ref(today.getMonth());
        const selectedDate = ref(today);
        
        const allBookings = ref([]); 

        onMounted(() => {
            const mockDate1 = new Date(); // 今天
            const mockDate2 = new Date(); 
            mockDate2.setDate(mockDate2.getDate() + 2); // 后天

            allBookings.value.push({
                id: 9001,
                campusId: 'nanhu',
                date: formatDateFull(mockDate1),
                timeRange: '16:30 - 18:30',
                paymentInfo: '周卡',
                type: 'booking'
            });
            allBookings.value.push({
                id: 9002,
                campusId: 'tech', // 测试不同校区
                date: formatDateFull(mockDate2),
                timeRange: '18:00 - 20:00',
                paymentInfo: '小时卡',
                type: 'booking'
            });
        });

        // 弹窗状态
        const showModal = ref(false);
        const bookingType = ref('hour'); // 'hour' | 'day'
        const formStart = ref('');
        const bookingDurationHours = ref(1.0); 

        // ================= 3. 计算属性 =================
        const currentCampus = computed(() => campuses.find(c => c.id === currentCampusId.value));
        const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate());
        const paddingDays = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay());
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // 获取特定校区在特定日期的排班时间
        const getScheduleFor = (campusId, dateObj) => {
            const day = dateObj.getDay();
            const allowedDays = CAMPUS_RULES[campusId];
            if (!allowedDays.includes(day)) return null;
            if (day === 0 || day === 6) return TIME_RULES.weekend;
            return TIME_RULES.weekday;
        };

        const currentSchedule = computed(() => {
            return getScheduleFor(currentCampusId.value, selectedDate.value);
        });

        const canBookDaily = computed(() => {
            if (!currentSchedule.value) return false;
            const scheduleStart = timeToMinutes(currentSchedule.value.start);
            const scheduleEnd = timeToMinutes(currentSchedule.value.end);
            const targetStart = timeToMinutes('08:30');
            const targetEnd = timeToMinutes('16:30');
            return scheduleStart <= targetStart && scheduleEnd >= targetEnd;
        });

        const calculatedEndTime = computed(() => {
            if (!formStart.value) return '--:--';
            const startMins = timeToMinutes(formStart.value);
            const endMins = startMins + (bookingDurationHours.value * 60);
            const h = Math.floor(endMins / 60);
            const m = endMins % 60;
            return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
        });

        const isTimeOverSchedule = computed(() => {
            if (!currentSchedule.value || bookingType.value === 'day') return false;
            const endMins = timeToMinutes(calculatedEndTime.value);
            const scheduleEndMins = timeToMinutes(currentSchedule.value.end);
            return endMins > scheduleEndMins;
        });

        const duration = computed(() => {
            if (bookingType.value === 'day') return 8; 
            return bookingDurationHours.value;
        });

        const costResult = computed(() => {
            const result = { affordable: false, useWeekCard: false, deductHour: 0, deductBean: 0 };
            const activeWeekCard = props.user.cards?.find(c => c.type === 'week' && c.status === 'active');
            if (activeWeekCard) {
                result.useWeekCard = true;
                result.affordable = true;
                return result;
            }
            let needHours = duration.value;
            let availableCardHours = 0;
            props.user.cards?.forEach(c => {
                if (c.type === 'hour' && c.status === 'active') availableCardHours += c.balance;
            });
            if (availableCardHours >= needHours) {
                result.deductHour = needHours;
                result.affordable = true;
            } else {
                result.deductHour = availableCardHours;
                const remainHours = needHours - availableCardHours;
                result.deductBean = remainHours * 4; 
                if (props.user.currencies['码豆'] >= result.deductBean) {
                    result.affordable = true;
                }
            }
            return result;
        });

        // ================= 4. 方法 =================
        function timeToMinutes(timeStr) {
            if (!timeStr || timeStr === '--:--') return 0;
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        }

        function adjustDuration(delta) {
            const newValue = bookingDurationHours.value + delta;
            if (newValue >= 1.0) bookingDurationHours.value = newValue;
        }

        function openBookingModal(type) {
            bookingType.value = type;
            bookingDurationHours.value = 1.0; 
            if (currentSchedule.value) {
                formStart.value = currentSchedule.value.start;
            }
            showModal.value = true;
        }

        function closeBookingModal() { showModal.value = false; }

        function confirmBooking() {
            if (isTimeOverSchedule.value) { emit('show-toast', '预约时间超出老师排班范围', 'error'); return; }

            if (!costResult.value.useWeekCard) {
                if (costResult.value.deductHour > 0) {
                    let need = costResult.value.deductHour;
                    props.user.cards.filter(c => c.type === 'hour' && c.status === 'active').forEach(c => {
                        if (need <= 0) return;
                        const take = Math.min(c.balance, need);
                        c.balance -= take;
                        need -= take;
                    });
                }
                if (costResult.value.deductBean > 0) {
                    props.user.currencies['码豆'] -= costResult.value.deductBean;
                }
            }

            const newBooking = {
                id: Date.now(),
                campusId: currentCampusId.value,
                date: formatDateFull(selectedDate.value),
                timeRange: bookingType.value === 'day' ? '08:30 - 16:30 (全天)' : `${formStart.value} - ${calculatedEndTime.value}`,
                paymentInfo: costResult.value.useWeekCard ? '周卡' : `混合支付`,
                type: 'booking'
            };
            allBookings.value.push(newBooking);
            closeBookingModal();
            emit('show-toast', '预约成功！请准时到达', 'success');
        }

        function changeMonth(delta) {
            let newMonth = currentMonth.value + delta;
            if (newMonth > 11) { currentYear.value++; newMonth = 0; }
            else if (newMonth < 0) { currentYear.value--; newMonth = 11; }
            currentMonth.value = newMonth;
        }
        function resetToToday() {
            const now = new Date();
            currentYear.value = now.getFullYear();
            currentMonth.value = now.getMonth();
            selectedDate.value = now;
        }
        function selectDate(day) {
            selectedDate.value = new Date(currentYear.value, currentMonth.value, day);
        }
        function isToday(date) { return new Date().toDateString() === new Date(currentYear.value, currentMonth.value, date).toDateString(); }
        function isSelected(date) { return selectedDate.value.getDate() === date; }
        
        function getDateCellClass(date) {
            let base = isSelected(date) ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-300 hover:shadow-md bg-white';
            return base;
        }

        // 检查特定校区在特定日期是否有排班
        function checkCampusSchedule(campusId, date) {
            const d = new Date(currentYear.value, currentMonth.value, date);
            const schedule = getScheduleFor(campusId, d);
            return !!schedule;
        }

        function hasMyBooking(date) {
            const dateStr = `${currentYear.value}年${currentMonth.value + 1}月${date}日`;
            return allBookings.value.some(b => b.date === dateStr);
        }

        function getCampusName(id) {
            const c = campuses.find(x => x.id === id);
            return c ? c.name : id;
        }

        function getCampusColor(id) {
            const c = campuses.find(x => x.id === id);
            return c ? c.color : 'bg-slate-300';
        }

        function formatDateFull(date) {
            return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
        }
        function getWeekday(date) {
            const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            return days[date.getDay()];
        }

        return {
            currentYear, currentMonth, selectedDate, weekDays, daysInMonth, paddingDays,
            campuses, currentCampusId, currentCampus,
            currentSchedule, canBookDaily,
            bookingType, showModal, allBookings,
            formStart, bookingDurationHours, calculatedEndTime, isTimeOverSchedule, costResult,
            duration, 
            changeMonth, resetToToday, selectDate, isToday, isSelected,
            getDateCellClass, checkCampusSchedule, hasMyBooking, formatDateFull, getWeekday,
            openBookingModal, closeBookingModal, confirmBooking, adjustDuration,
            getCampusName, getCampusColor
        };
    }
};

window.CalendarFeature = CalendarFeature;