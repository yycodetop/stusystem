// ==========================================
// 模块名称：考试中心 (Feature Exam Center)
// 版本：V3.41 (UI简化版)
// 更新内容：
// 1. [UI] “模拟练习”布局重构：移除左侧边栏，改为顶部筛选+全宽列表，与考试大厅保持一致。
// 2. [UI] “学习数据”表格精简：移除了“状态”列和“操作”列。
// 3. [Logic] 保持点击行查看历史试卷的交互逻辑。
// ==========================================

// --- 工具：通用分页逻辑 ---
const usePagination = (dataRef, pageSize = 6) => {
    const { ref, computed, watch } = Vue;
    const currentPage = ref(1);

    // 当数据源长度变化时（如搜索过滤），重置到第一页
    watch(() => dataRef.value.length, () => {
        currentPage.value = 1;
    });

    const totalPages = computed(() => Math.ceil(dataRef.value.length / pageSize) || 1);
    
    const paginatedData = computed(() => {
        const start = (currentPage.value - 1) * pageSize;
        return dataRef.value.slice(start, start + pageSize);
    });

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
    };

    return { currentPage, totalPages, paginatedData, changePage };
};

// --- 子模块 1: 考试逻辑 (Exams) ---
const useExamLogic = (user, emit, startPracticeRef) => {
    const { ref, computed } = Vue;
    
    const examFilter = ref('all'); 
    const examSearch = ref(''); // 搜索关键词
    const privateCode = ref('');
    const showPrivateModal = ref(false);
    const pendingExam = ref(null);
    
    // 本地化确认弹窗状态
    const showExamConfirmModal = ref(false);
    const selectedExam = ref(null);

    const exams = ref([
        { id: 101, title: '2025 春季期末综合考核', type: 'public', status: 'live', startTime: '2025-10-24 09:00', endTime: '2025-10-24 11:00', duration: 120, participants: 342, tags: ['C++', '期末'] },
        { id: 102, title: 'CSP-J 模拟赛 (二)', type: 'public', status: 'upcoming', startTime: '2025-10-26 14:00', endTime: '2025-10-26 17:30', duration: 210, participants: 120, tags: ['模拟', '算法'] },
        { id: 201, title: '及格班专属测试', type: 'private', status: 'live', startTime: '2025-10-24 10:00', endTime: '2025-10-24 11:30', duration: 90, participants: 45, tags: ['内部', '需密码'], password: '123' },
        { id: 103, title: '第一单元阶段测验', type: 'public', status: 'ended', startTime: '2025-10-01 09:00', endTime: '2025-10-01 10:00', duration: 60, participants: 500, tags: ['基础'] },
        { id: 104, title: 'C++ 指针专项突破', type: 'public', status: 'upcoming', startTime: '2025-11-01 19:00', endTime: '2025-11-01 20:30', duration: 90, participants: 88, tags: ['指针', '进阶'] },
        { id: 105, title: '第15届蓝桥杯选拔赛', type: 'public', status: 'ended', startTime: '2025-09-15 09:00', endTime: '2025-09-15 12:00', duration: 180, participants: 1200, tags: ['蓝桥杯'] },
        { id: 106, title: 'NOIP 普及组真题演练', type: 'public', status: 'live', startTime: '2025-10-24 08:00', endTime: '2025-10-24 20:00', duration: 120, participants: 56, tags: ['NOIP'] },
        { id: 202, title: '奥赛班内部摸底', type: 'private', status: 'upcoming', startTime: '2025-10-27 18:00', endTime: '2025-10-27 20:00', duration: 120, participants: 12, tags: ['高端'], password: '456' },
    ]);

    const filteredExams = computed(() => {
        let list = exams.value;
        if (examFilter.value !== 'all') list = list.filter(e => e.type === examFilter.value);
        if (examSearch.value.trim()) list = list.filter(e => e.title.toLowerCase().includes(examSearch.value.toLowerCase()));
        return list;
    });

    const { currentPage, totalPages, paginatedData: paginatedExams, changePage } = usePagination(filteredExams, 6);

    const getStatusStyle = (status) => {
        if (status === 'live') return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', label: '进行中', icon: 'fa-circle-play' };
        if (status === 'upcoming') return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', label: '未开始', icon: 'fa-clock' };
        return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: '已结束', icon: 'fa-circle-check' };
    };

    const handleEnterExam = (exam) => {
        if (exam.status === 'ended') { emit('show-toast', '考试已结束', 'info'); return; }
        if (exam.status === 'upcoming') { emit('show-toast', '考试尚未开始', 'info'); return; }
        
        if (exam.type === 'private') { 
            pendingExam.value = exam; 
            privateCode.value = ''; 
            showPrivateModal.value = true; 
        } else { 
            openExamConfirm(exam);
        }
    };

    const confirmPrivateCode = () => {
        if (privateCode.value === pendingExam.value.password) { 
            showPrivateModal.value = false; 
            openExamConfirm(pendingExam.value); 
        } else { 
            emit('show-toast', '考试码错误', 'error'); 
        }
    };

    const openExamConfirm = (exam) => {
        selectedExam.value = exam;
        showExamConfirmModal.value = true;
    };

    const realStartExam = () => {
        if (!selectedExam.value) return;
        
        showExamConfirmModal.value = false;
        emit('show-toast', '正在加载试卷...', 'success');
        
        emit('toggle-lockdown', true);
        
        const examPracticeObj = {
            id: `exam-${selectedExam.value.id}`,
            title: selectedExam.value.title,
            count: 20, 
            timeLimit: selectedExam.value.duration,
            isExam: true
        };
        
        if (startPracticeRef && startPracticeRef.value) {
            startPracticeRef.value('timed', examPracticeObj);
        }
    };

    return { 
        examFilter, examSearch,
        paginatedExams, currentPage, totalPages, changePage,
        showPrivateModal, privateCode, getStatusStyle, handleEnterExam, confirmPrivateCode,
        showExamConfirmModal, selectedExam, realStartExam 
    };
};

// --- 子模块 2: 练习逻辑 (Practice) ---
const usePracticeLogic = (user, emit, addHistoryRecord) => {
    const { ref, computed } = Vue;
    
    // UI State
    const practiceView = ref('list'); 
    const practiceSearch = ref('');
    const selectedTag = ref('全部');
    const showModeSelectModal = ref(false);
    const selectedPractice = ref(null);

    // Runner State
    const currentMode = ref('study'); 
    const currentQIndex = ref(0);
    const userAnswers = ref({}); 
    const showAnalysis = ref({}); 
    const timeRemaining = ref(0);
    const timerInterval = ref(null);
    const showCard = ref(true); 
    
    // Summary State
    const examResult = ref(null);

    const practices = ref([
        { id: 1, title: 'C++ 基础综合模拟卷 A', count: 10, tags: ['语法', '综合'], difficulty: '简单', timeLimit: 30 },
        { id: 2, title: 'CSP-J 初赛真题 (2023)', count: 20, tags: ['真题', '算法'], difficulty: '困难', timeLimit: 60 },
        { id: 3, title: '循环与数组专项训练', count: 15, tags: ['循环', '数组'], difficulty: '中等', timeLimit: 45 },
        { id: 4, title: '逻辑运算与位运算', count: 12, tags: ['语法', '算法'], difficulty: '中等', timeLimit: 40 },
        { id: 5, title: 'C++ 函数与递归入门', count: 8, tags: ['语法'], difficulty: '简单', timeLimit: 25 },
        { id: 6, title: 'STL 容器专项练习', count: 15, tags: ['语法', '综合'], difficulty: '困难', timeLimit: 50 },
        { id: 7, title: '2024 春季入门测试', count: 10, tags: ['综合'], difficulty: '简单', timeLimit: 30 },
        { id: 8, title: '贪心算法基础题', count: 5, tags: ['算法'], difficulty: '中等', timeLimit: 40 },
        { id: 9, title: '动态规划初探', count: 8, tags: ['算法'], difficulty: '困难', timeLimit: 50 },
        { id: 10, title: 'NOIP 普及组模拟', count: 20, tags: ['真题'], difficulty: '中等', timeLimit: 60 },
    ]);
    
    // Mock Paper Data
    const mockPaperData = [
        { id: 101, section: '单项选择题', type: 'choice', text: 'C++ 中 int 类型的变量通常占用多少字节？', options: ['1 byte', '2 bytes', '4 bytes', '8 bytes'], correct: 2, analysis: '在常见的 32 位和 64 位编译器中，int 通常占用 4 字节。', score: 3 },
        { id: 102, section: '单项选择题', type: 'choice', text: '下列哪个是合法的变量名？', options: ['1_var', 'class', '_count', 'a-b'], correct: 2, analysis: '变量名只能包含字母、数字和下划线，且不能以数字开头，不能是关键字。', score: 3 },
        { id: 103, section: '单项选择题', type: 'choice', text: 'for(int i=0; i<10; i++) 循环执行多少次？', options: ['9', '10', '11', '0'], correct: 1, analysis: '从 0 到 9，共 10 次。', score: 3 },
        { id: 201, section: '判断题', type: 'tf', text: '在 C++ 中，数组的下标是从 1 开始的。', options: ['正确', '错误'], correct: 1, analysis: 'C++ 数组下标从 0 开始。', score: 2 },
        { id: 202, section: '判断题', type: 'tf', text: 'break 语句只能用于循环语句中。', options: ['正确', '错误'], correct: 1, analysis: 'break 还可以用于 switch 语句。', score: 2 },
        { 
            id: 301, 
            section: '编程题', 
            type: 'coding', 
            title: 'A + B 问题', 
            text: '编写一个程序，输入两个整数 a 和 b，输出它们的和。请注意处理大数相加的情况。', 
            inputFormat: '一行，包含两个整数 a, b，中间用空格隔开。', 
            outputFormat: '一行，一个整数，表示 a + b 的结果。', 
            dataRange: '0 <= a, b <= 10^9', 
            sampleInput: '1 2', 
            sampleOutput: '3', 
            initialCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // 请在此处编写代码\n    return 0;\n}', 
            refCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}', 
            analysis: '使用 cin 读取两个变量，建议使用 long long 防止溢出，使用 cout 输出相加结果。', 
            score: 20 
        }
    ];
    
    const currentQuestions = ref([]); 

    const questionGroups = computed(() => {
        const groups = {};
        currentQuestions.value.forEach((q, idx) => {
            if (!groups[q.section]) groups[q.section] = [];
            groups[q.section].push({ ...q, globalIndex: idx });
        });
        return groups;
    });

    const tags = ['全部', '语法', '循环', '数组', '算法', '真题', '综合'];

    const filteredPractices = computed(() => {
        let list = practices.value;
        if (selectedTag.value !== '全部') list = list.filter(p => p.tags.includes(selectedTag.value));
        if (practiceSearch.value.trim()) list = list.filter(p => p.title.toLowerCase().includes(practiceSearch.value.toLowerCase()));
        return list;
    });

    const { currentPage, totalPages, paginatedData: paginatedPractices, changePage } = usePagination(filteredPractices, 9); // 每页9个

    const preparePractice = (practice) => { selectedPractice.value = practice; showModeSelectModal.value = true; };

    const startPractice = (mode, overridePractice = null) => {
        if (overridePractice) {
            selectedPractice.value = overridePractice;
        }
        currentMode.value = mode;
        showModeSelectModal.value = false;
        practiceView.value = 'runner';
        emit('toggle-lockdown', true);
        currentQuestions.value = JSON.parse(JSON.stringify(mockPaperData)); 
        currentQIndex.value = 0;
        userAnswers.value = {};
        showAnalysis.value = {};
        examResult.value = null; 
        if (mode === 'timed') {
            timeRemaining.value = selectedPractice.value.timeLimit * 60;
            startTimer();
        }
    };

    const loadSession = (record) => {
        selectedPractice.value = { title: record.title, timeLimit: 0 }; 
        currentQuestions.value = record.snapshot.questions;
        userAnswers.value = record.snapshot.answers;
        examResult.value = record.snapshot.result;
        practiceView.value = 'summary';
    };

    const startTimer = () => {
        if (timerInterval.value) clearInterval(timerInterval.value);
        timerInterval.value = setInterval(() => {
            timeRemaining.value--;
            if (timeRemaining.value <= 0) submitPractice(true);
        }, 1000);
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleOptionSelect = (qId, idx) => {
        if (currentMode.value === 'review' || (currentMode.value === 'study' && showAnalysis.value[qId])) return; 
        userAnswers.value[qId] = idx;
        if (currentMode.value === 'study') showAnalysis.value[qId] = true;
    };

    const jumpToQuestion = (idx) => { currentQIndex.value = idx; };
    const nextQuestion = () => { if (currentQIndex.value < currentQuestions.value.length - 1) currentQIndex.value++; };
    const prevQuestion = () => { if (currentQIndex.value > 0) currentQIndex.value--; };

    const runCode = (qId) => { emit('show-toast', '请在编程工作台中运行代码', 'info'); };

    const submitPractice = (force = false) => {
        const doSubmit = () => {
            if (timerInterval.value) clearInterval(timerInterval.value);
            emit('toggle-lockdown', false);
            const result = {
                totalScore: 0,
                maxScore: 0,
                sections: {
                    '单项选择题': { total: 0, correct: 0, score: 0, maxScore: 0 },
                    '判断题': { total: 0, correct: 0, score: 0, maxScore: 0 },
                    '编程题': { total: 0, correct: 0, score: 0, maxScore: 0 }
                },
                timeUsed: selectedPractice.value.timeLimit * 60 - timeRemaining.value
            };
            currentQuestions.value.forEach(q => {
                const section = q.section;
                result.maxScore += q.score;
                result.sections[section].maxScore += q.score;
                result.sections[section].total += 1;
                let isCorrect = false;
                let earnedScore = 0;
                if (q.type === 'coding') {
                    const code = userAnswers.value[q.id] || '';
                    if (code.length > 20 && code.includes('iostream')) {
                        earnedScore = q.score;
                        isCorrect = true;
                    }
                } else {
                    if (userAnswers.value[q.id] === q.correct) {
                        earnedScore = q.score;
                        isCorrect = true;
                    }
                }
                if (isCorrect) result.sections[section].correct += 1;
                result.sections[section].score += earnedScore;
                result.totalScore += earnedScore;
            });
            examResult.value = result;
            practiceView.value = 'summary'; 
            emit('show-toast', '交卷成功，成绩已保存', 'success');
            if (addHistoryRecord) {
                addHistoryRecord({
                    title: selectedPractice.value.title,
                    type: selectedPractice.value.isExam ? '考试' : '练习',
                    score: result.totalScore,
                    totalScore: result.maxScore,
                    date: new Date().toLocaleString(),
                    status: result.totalScore >= result.maxScore * 0.6 ? 'Passed' : 'Failed',
                    snapshot: {
                        questions: JSON.parse(JSON.stringify(currentQuestions.value)),
                        answers: JSON.parse(JSON.stringify(userAnswers.value)),
                        result: result
                    }
                });
            }
        };
        if (!force) {
            emit('show-modal', { type: 'confirm', title: '交卷确认', message: '确定要结束作答并提交吗？', callback: (ok) => { if (ok) doSubmit(); } });
        } else {
            emit('show-toast', '时间到，自动交卷！', 'warning');
            doSubmit();
        }
    };
    
    const viewAnalysis = () => {
        currentMode.value = 'review';
        practiceView.value = 'runner';
        currentQuestions.value.forEach(q => { showAnalysis.value[q.id] = true; });
        currentQIndex.value = 0; 
        emit('show-toast', '进入复盘模式', 'info');
    };

    const exitPractice = () => {
        if (currentMode.value === 'review') {
            practiceView.value = 'summary';
            return;
        }
        emit('show-modal', { 
            type: 'confirm', 
            title: '退出练习', 
            message: '当前进度将丢失，确定退出吗？', 
            callback: (ok) => { 
                if (ok) { 
                    if (timerInterval.value) clearInterval(timerInterval.value); 
                    emit('toggle-lockdown', false);
                    practiceView.value = 'list'; 
                } 
            } 
        });
    };

    const exitSummary = () => { practiceView.value = 'list'; };

    const getCardClass = (q) => {
        let base = "aspect-square rounded flex items-center justify-center text-xs font-bold cursor-pointer transition border ";
        const isCurrent = currentQIndex.value === q.globalIndex;
        base += isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1 border-indigo-500 ' : 'border-slate-200 ';
        const ans = userAnswers.value[q.id];
        const hasAns = ans !== undefined && ans !== null && ans !== '';
        if (currentMode.value === 'review') {
             let isCorrect = false;
             if (q.type === 'coding') { isCorrect = hasAns && ans.length > 20 && ans.includes('iostream'); } else { isCorrect = hasAns && ans === q.correct; }
             if (isCorrect) return base + 'bg-green-500 text-white border-green-500'; 
             return base + 'bg-red-500 text-white border-red-500';
        }
        if (currentMode.value === 'study' && hasAns) {
             let isCorrect = (q.type !== 'coding' && ans === q.correct) || (q.type === 'coding' && showAnalysis.value[q.id]);
             if (q.type === 'choice' || q.type === 'tf') { return base + (isCorrect ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'); }
             return base + 'bg-indigo-500 text-white border-indigo-500';
        }
        if (hasAns) return base + 'bg-indigo-100 text-indigo-600 border-indigo-200';
        return base + 'bg-white text-slate-500 hover:bg-slate-50';
    };

    return { 
        practiceView, practiceSearch, selectedTag, tags, 
        paginatedPractices, currentPage, totalPages, changePage,
        showModeSelectModal, selectedPractice, preparePractice, startPractice, loadSession,
        currentMode, currentQIndex, currentQuestions, userAnswers, showAnalysis, timeRemaining, formatTime,
        handleOptionSelect, jumpToQuestion, nextQuestion, prevQuestion, submitPractice, exitPractice,
        questionGroups, showCard, runCode,
        examResult, exitSummary, viewAnalysis, getCardClass 
    };
};

// --- 子模块 3: 历史数据逻辑 (History) ---
const useHistoryLogic = (user, emit) => {
    const { ref, computed } = Vue;
    const stats = ref({ totalExams: 16, avgScore: 89, totalPractice: 332, winRate: '92%' });
    const historySearch = ref(''); 
    
    const historyRecords = ref([
        { id: 103, title: '第一单元阶段测验', type: '考试', score: 95, totalScore: 100, date: '2025-10-01', status: 'Passed', snapshot: null },
        { id: 99, title: '循环结构专项练', type: '练习', score: 80, totalScore: 100, date: '2025-09-28', status: 'Passed', snapshot: null },
        { id: 98, title: '数组基础练习', type: '练习', score: 60, totalScore: 100, date: '2025-09-25', status: 'Failed', snapshot: null },
        { id: 97, title: 'C++ 入门测试', type: '考试', score: 88, totalScore: 100, date: '2025-09-20', status: 'Passed', snapshot: null },
        { id: 96, title: '字符串操作', type: '练习', score: 92, totalScore: 100, date: '2025-09-18', status: 'Passed', snapshot: null },
        { id: 95, title: '函数与递归', type: '练习', score: 75, totalScore: 100, date: '2025-09-15', status: 'Passed', snapshot: null },
        { id: 94, title: '9月月考', type: '考试', score: 82, totalScore: 100, date: '2025-09-10', status: 'Passed', snapshot: null },
        { id: 93, title: '指针基础', type: '练习', score: 55, totalScore: 100, date: '2025-09-08', status: 'Failed', snapshot: null },
    ]);

    const getScoreColor = (s) => s >= 90 ? 'text-green-600 bg-green-50 border-green-200' : (s >= 60 ? 'text-indigo-600 bg-indigo-50 border-indigo-200' : 'text-red-600 bg-red-50 border-red-200');
    
    const filteredHistory = computed(() => {
        if (!historySearch.value.trim()) return historyRecords.value;
        return historyRecords.value.filter(rec => rec.title.toLowerCase().includes(historySearch.value.toLowerCase()));
    });

    const { currentPage, totalPages, paginatedData: paginatedHistory, changePage } = usePagination(filteredHistory, 7);

    const addRecord = (record) => {
        historyRecords.value.unshift({ id: Date.now(), ...record });
        stats.value.totalPractice++;
        stats.value.avgScore = Math.round((stats.value.avgScore * (stats.value.totalPractice - 1) + (record.score / record.totalScore * 100)) / stats.value.totalPractice);
    };

    return { 
        stats, historySearch, 
        paginatedHistory, currentPage, totalPages, changePage,
        getScoreColor, addRecord 
    };
};

// --- 主组件 ---
const ExamCenterFeature = {
    props: ['user'],
    emits: ['open-problem', 'show-toast', 'show-modal', 'go-back', 'toggle-lockdown'],
    
    template: `
    <div class="h-full flex flex-col animate-fade-in-up">
        
        <!-- 1. 顶部 Tab 导航 -->
        <div v-if="practiceView === 'list'" class="flex border-b border-slate-200 bg-white mb-6 rounded-lg shadow-sm flex-shrink-0">
            <button @click="currentTab = 'exam'" class="flex-1 py-4 text-center font-bold text-sm transition relative" :class="currentTab === 'exam' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'">
                <i class="fa-solid fa-pen-nib mr-1"></i> 考试中心
                <div v-if="currentTab === 'exam'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            </button>
            <div class="w-px bg-slate-100 my-2"></div>
            <button @click="currentTab = 'practice'" class="flex-1 py-4 text-center font-bold text-sm transition relative" :class="currentTab === 'practice' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'">
                <i class="fa-solid fa-dumbbell mr-1"></i> 模拟练习
                <div v-if="currentTab === 'practice'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            </button>
            <div class="w-px bg-slate-100 my-2"></div>
            <button @click="currentTab = 'history'" class="flex-1 py-4 text-center font-bold text-sm transition relative" :class="currentTab === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'">
                <i class="fa-solid fa-chart-pie mr-1"></i> 学习数据
                <div v-if="currentTab === 'history'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            </button>
        </div>

        <!-- 列表内容区域 -->
        <div v-if="practiceView === 'list'" class="flex-1 overflow-hidden relative">
            
            <!-- Tab 1: 考试大厅 -->
            <div v-if="currentTab === 'exam'" class="h-full flex flex-col p-6 animate-fade-in overflow-hidden">
                <div class="flex justify-between items-center mb-6 shrink-0">
                    <div class="flex gap-2">
                        <button @click="examFilter = 'all'" class="px-4 py-1.5 rounded-full text-xs font-bold border transition" :class="examFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'">全部</button>
                        <button @click="examFilter = 'public'" class="px-4 py-1.5 rounded-full text-xs font-bold border transition" :class="examFilter === 'public' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'">公开赛</button>
                        <button @click="examFilter = 'private'" class="px-4 py-1.5 rounded-full text-xs font-bold border transition" :class="examFilter === 'private' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'">专属考场</button>
                    </div>
                    <div class="relative w-64">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input v-model="examSearch" type="text" placeholder="搜索考试..." class="w-full pl-8 pr-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs focus:outline-none focus:border-blue-500 transition shadow-sm">
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto custom-scrollbar p-1">
                    <div v-if="paginatedExams.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div v-for="exam in paginatedExams" :key="exam.id" class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all group relative overflow-hidden flex flex-col">
                            <div class="flex justify-between items-start mb-3">
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border" :class="getStatusStyle(exam.status).bg + ' ' + getStatusStyle(exam.status).text + ' ' + getStatusStyle(exam.status).border"><i class="fa-solid" :class="getStatusStyle(exam.status).icon"></i> {{ getStatusStyle(exam.status).label }}</span>
                                <i v-if="exam.type === 'private'" class="fa-solid fa-lock text-slate-300" title="专属"></i>
                            </div>
                            <h3 class="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition truncate" :title="exam.title">{{ exam.title }}</h3>
                            <div class="text-xs text-slate-500 space-y-2 mb-6">
                                <div class="flex items-center gap-2"><i class="fa-regular fa-calendar w-4 text-center"></i> {{ exam.startTime }}</div>
                                <div class="flex items-center gap-2"><i class="fa-regular fa-clock w-4 text-center"></i> 时长: {{ exam.duration }}分钟</div>
                                <div class="flex items-center gap-2"><i class="fa-solid fa-user-group w-4 text-center"></i> {{ exam.participants }} 人已报名</div>
                            </div>
                            <div class="mt-auto flex items-center justify-between">
                                <div class="flex gap-1"><span v-for="tag in exam.tags" :key="tag" class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{{ tag }}</span></div>
                                <button @click="handleEnterExam(exam)" :disabled="exam.status === 'ended'" class="px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm" :class="exam.status === 'ended' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 transform active:scale-95'">{{ exam.status === 'ended' ? '已结束' : '进入考场' }} <i v-if="exam.status !== 'ended'" class="fa-solid fa-arrow-right"></i></button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="h-64 flex flex-col items-center justify-center text-slate-400">
                        <i class="fa-solid fa-inbox text-4xl mb-2 opacity-50"></i>
                        <p class="text-sm">没有找到相关考试</p>
                    </div>
                </div>

                <div v-if="totalPages > 1" class="mt-4 flex justify-center items-center gap-4 shrink-0">
                    <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                    <span class="text-xs font-bold text-slate-500">Page {{ currentPage }} / {{ totalPages }}</span>
                    <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                </div>
            </div>

            <!-- Tab 2: 模拟练习 (Layout Refactored) -->
            <div v-else-if="currentTab === 'practice'" class="h-full flex flex-col p-6 animate-fade-in overflow-hidden">
                <!-- 顶部筛选 (移至顶部) -->
                <div class="flex justify-between items-center mb-6 shrink-0">
                    <div class="flex flex-wrap gap-2">
                        <button v-for="tag in tags" :key="tag" @click="selectedTag = tag" 
                                class="px-4 py-1.5 rounded-full text-xs font-bold border transition" 
                                :class="selectedTag === tag ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'">
                            {{ tag }}
                        </button>
                    </div>
                    <div class="relative w-64">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input v-model="practiceSearch" type="text" placeholder="搜索练习集..." class="w-full pl-8 pr-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition shadow-sm">
                    </div>
                </div>

                <!-- 练习列表 Grid (全宽) -->
                <div class="flex-1 overflow-y-auto custom-scrollbar p-1">
                    <div v-if="paginatedPractices.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div v-for="practice in paginatedPractices" :key="practice.id" class="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-400 hover:shadow-lg transition-all group cursor-pointer flex flex-col relative overflow-hidden" @click="preparePractice(practice)">
                            <div class="flex justify-between items-start mb-3">
                                <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">{{ practice.difficulty }}</span>
                                <div class="text-xs text-slate-400 flex items-center gap-1"><i class="fa-regular fa-clock"></i> {{ practice.timeLimit }}分钟</div>
                            </div>
                            <h4 class="font-bold text-slate-800 text-lg mb-2 group-hover:text-emerald-600 transition truncate">{{ practice.title }}</h4>
                            <div class="text-xs text-slate-500 mb-4 flex items-center gap-2">
                                <i class="fa-solid fa-list-ol"></i> 共 {{ practice.count }} 道题目
                            </div>
                            <div class="mt-auto flex justify-between items-center">
                                <div class="flex gap-1"><span v-for="t in practice.tags" :key="t" class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{{ t }}</span></div>
                                <div class="size-8 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition"><i class="fa-solid fa-play text-xs ml-0.5"></i></div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="h-64 flex flex-col items-center justify-center text-slate-400">
                        <i class="fa-solid fa-file-circle-question text-4xl mb-2 opacity-50"></i>
                        <p class="text-sm">没有找到相关练习</p>
                    </div>
                </div>

                <!-- 分页 Footer -->
                <div v-if="totalPages > 1" class="mt-4 flex justify-center items-center gap-4 shrink-0">
                    <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                    <span class="text-xs font-bold text-slate-500">Page {{ currentPage }} / {{ totalPages }}</span>
                    <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                </div>
            </div>

            <!-- Tab 3: 学习数据 (Table Simplified) -->
            <div v-else-if="currentTab === 'history'" class="h-full flex flex-col p-6 animate-fade-in overflow-hidden">
                <div class="grid grid-cols-4 gap-4 mb-8 shrink-0">
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div class="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><i class="fa-solid fa-file-pen"></i></div>
                        <div><div class="text-2xl font-bold text-slate-800">{{ stats.totalExams }}</div><div class="text-xs text-slate-400">参加考试</div></div>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div class="size-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><i class="fa-solid fa-star"></i></div>
                        <div><div class="text-2xl font-bold text-slate-800">{{ stats.avgScore }}</div><div class="text-xs text-slate-400">平均分</div></div>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div class="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><i class="fa-solid fa-dumbbell"></i></div>
                        <div><div class="text-2xl font-bold text-slate-800">{{ stats.totalPractice }}</div><div class="text-xs text-slate-400">累计练习</div></div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 class="font-bold text-slate-700 text-sm">做题记录</h3>
                        <div class="relative w-48">
                            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                            <input v-model="historySearch" type="text" placeholder="搜索记录..." class="w-full pl-8 pr-4 py-1 rounded-full bg-white border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition shadow-sm">
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto">
                        <table class="w-full text-left text-sm">
                            <!-- [UPDATED] 移除了 状态(Status) 和 操作(Action) 列 -->
                            <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase sticky top-0">
                                <tr>
                                    <th class="p-4">名称</th>
                                    <th class="p-4">类型</th>
                                    <th class="p-4">时间</th>
                                    <th class="p-4 text-center">得分</th>
                                </tr>
                            </thead>
                            <tbody v-if="paginatedHistory.length > 0">
                                <tr v-for="rec in paginatedHistory" :key="rec.id" 
                                    class="border-b border-slate-50 hover:bg-slate-50 transition group cursor-pointer" 
                                    @click="rec.snapshot ? handleViewRecord(rec) : null" 
                                    title="点击查看详情">
                                    <td class="p-4 font-bold text-slate-700">{{ rec.title }}</td>
                                    <td class="p-4"><span class="text-xs px-2 py-0.5 rounded border" :class="rec.type === '考试' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'">{{ rec.type }}</span></td>
                                    <td class="p-4 text-slate-500 font-mono text-xs">{{ rec.date }}</td>
                                    <td class="p-4 text-center font-bold font-mono" :class="getScoreColor(rec.score)">{{ rec.score }}/{{ rec.totalScore }}</td>
                                </tr>
                            </tbody>
                            <tbody v-else>
                                <tr>
                                    <td colspan="4" class="p-8 text-center text-slate-400 text-xs">没有找到相关记录</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-if="totalPages > 1" class="p-3 border-t border-slate-100 flex justify-center items-center gap-4 bg-slate-50/30">
                        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="size-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition bg-white"><i class="fa-solid fa-chevron-left text-[10px]"></i></button>
                        <span class="text-[10px] font-bold text-slate-500">Page {{ currentPage }} / {{ totalPages }}</span>
                        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="size-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition bg-white"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. 全屏答题/复盘界面 -->
        <div v-if="practiceView === 'runner'" class="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-scale-in origin-bottom">
            <!-- Top Bar -->
            <div class="h-14 bg-white border-b border-slate-200 flex justify-between items-center px-4 shrink-0 z-20 shadow-sm select-none">
                <div class="flex items-center gap-4">
                    <button @click="exitPractice" class="text-slate-400 hover:text-slate-600 transition flex items-center gap-1">
                        <i class="fa-solid fa-arrow-left"></i> 
                        <span class="text-xs font-bold">{{ currentMode === 'review' ? '返回成绩单' : '退出全屏' }}</span>
                    </button>
                    <div class="h-4 w-px bg-slate-200"></div>
                    <h3 class="font-bold text-slate-800 text-sm">{{ selectedPractice.title }}</h3>
                </div>
                <div class="flex items-center gap-6">
                    <span v-if="currentMode === 'study'" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">看题学习模式</span>
                    <span v-else-if="currentMode === 'mock'" class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">模拟考试模式</span>
                    <span v-else-if="currentMode === 'timed'" class="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 flex items-center gap-1"><i class="fa-solid fa-shield-halved"></i> 考试专注模式</span>
                    <span v-else-if="currentMode === 'review'" class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1"><i class="fa-solid fa-magnifying-glass-chart"></i> 试卷解析</span>

                    <template v-if="currentMode !== 'review'">
                        <div v-if="currentMode === 'timed'" class="font-mono text-lg font-bold flex items-center gap-2" :class="timeRemaining < 60 ? 'text-red-500 animate-pulse' : 'text-slate-700'"><i class="fa-regular fa-clock"></i> {{ formatTime(timeRemaining) }}</div>
                        <button @click="submitPractice(false)" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-1.5 rounded text-xs font-bold shadow-sm transition">交卷</button>
                    </template>
                </div>
            </div>

            <div class="flex-1 flex overflow-hidden">
                <!-- Left: Answer Card -->
                <div class="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300" :class="{'w-0 opacity-0 overflow-hidden': !showCard}">
                    <div class="p-4 border-b border-slate-100 font-bold text-slate-700 text-sm flex justify-between items-center">
                        <span>答题卡</span>
                        <span class="text-xs text-slate-400">{{ Object.keys(userAnswers).length }} / {{ currentQuestions.length }}</span>
                    </div>
                    <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div v-for="(group, section) in questionGroups" :key="section" class="mb-6">
                            <h4 class="text-xs font-bold text-slate-500 mb-2">{{ section }}</h4>
                            <div class="grid grid-cols-5 gap-2">
                                <div v-for="q in group" :key="q.id" @click="jumpToQuestion(q.globalIndex)" :class="getCardClass(q)">{{ q.globalIndex + 1 }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Toggle Button -->
                <div class="absolute left-0 top-1/2 z-30" :class="{'left-64': showCard}">
                    <button @click="showCard = !showCard" class="bg-white border border-slate-200 border-l-0 rounded-r p-1 shadow-sm text-slate-400 hover:text-indigo-600 text-xs"><i class="fa-solid" :class="showCard ? 'fa-chevron-left' : 'fa-chevron-right'"></i></button>
                </div>

                <!-- Center: Question Content -->
                <div class="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
                    <div class="max-w-3xl mx-auto">
                        <div class="mb-6">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded">{{ currentQuestions[currentQIndex].type === 'choice' ? '单选题' : (currentQuestions[currentQIndex].type === 'tf' ? '判断题' : '编程题') }}</span>
                                <span class="text-xs text-slate-500 font-bold">({{ currentQuestions[currentQIndex].score }}分)</span>
                            </div>
                            <h3 v-if="currentQuestions[currentQIndex].type === 'coding'" class="text-lg font-bold text-slate-800 leading-relaxed">{{ currentQIndex + 1 }}. {{ currentQuestions[currentQIndex].title }}</h3>
                            <h3 v-else class="text-lg font-bold text-slate-800 leading-relaxed">{{ currentQIndex + 1 }}. {{ currentQuestions[currentQIndex].text }}</h3>
                        </div>

                        <div class="mb-8">
                            <!-- Choice/TF -->
                            <div v-if="['choice', 'tf'].includes(currentQuestions[currentQIndex].type)" class="space-y-3">
                                <div v-for="(opt, idx) in currentQuestions[currentQIndex].options" :key="idx"
                                     @click="handleOptionSelect(currentQuestions[currentQIndex].id, idx)"
                                     class="p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 group relative"
                                     :class="[userAnswers[currentQuestions[currentQIndex].id] === idx ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-white', (currentMode === 'review' && idx === currentQuestions[currentQIndex].correct) ? 'ring-2 ring-green-500 ring-opacity-50' : '']">
                                    <div class="size-6 rounded-full border flex items-center justify-center text-xs font-bold transition-colors" :class="userAnswers[currentQuestions[currentQIndex].id] === idx ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 text-slate-400'">{{ ['A', 'B', 'C', 'D'][idx] }}</div>
                                    <span class="text-sm text-slate-700">{{ opt }}</span>
                                    <div v-if="(currentMode === 'study' && showAnalysis[currentQuestions[currentQIndex].id]) || currentMode === 'review'" class="ml-auto flex items-center gap-2">
                                        <span v-if="currentMode === 'review' && idx === currentQuestions[currentQIndex].correct" class="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">正确答案</span>
                                        <i v-if="idx === currentQuestions[currentQIndex].correct" class="fa-solid fa-check text-green-500 text-lg"></i>
                                        <i v-else-if="userAnswers[currentQuestions[currentQIndex].id] === idx" class="fa-solid fa-xmark text-red-500 text-lg"></i>
                                    </div>
                                </div>
                            </div>

                            <!-- Coding Question -->
                            <div v-else-if="currentQuestions[currentQIndex].type === 'coding'" class="flex flex-col gap-6">
                                <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                     <div class="mb-5"><h4 class="font-bold text-sm text-slate-700 mb-2 border-l-4 border-indigo-500 pl-2">题目描述</h4><p class="text-sm text-slate-600 leading-relaxed">{{ currentQuestions[currentQIndex].text }}</p></div>
                                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                                         <div><h4 class="font-bold text-sm text-slate-700 mb-2 border-l-4 border-blue-500 pl-2">输入格式</h4><div class="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">{{ currentQuestions[currentQIndex].inputFormat }}</div></div>
                                         <div><h4 class="font-bold text-sm text-slate-700 mb-2 border-l-4 border-blue-500 pl-2">输出格式</h4><div class="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">{{ currentQuestions[currentQIndex].outputFormat }}</div></div>
                                     </div>
                                     <div class="mb-5"><h4 class="font-bold text-sm text-slate-700 mb-2 border-l-4 border-amber-500 pl-2">数据范围</h4><div class="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-2.5 rounded-lg flex items-center gap-2"><i class="fa-solid fa-triangle-exclamation"></i> {{ currentQuestions[currentQIndex].dataRange }}</div></div>
                                     <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                         <div><h4 class="font-bold text-sm text-slate-700 mb-2 border-l-4 border-slate-500 pl-2">输入样例</h4><div class="relative group"><pre class="bg-[#1e1e1e] text-slate-200 p-3 rounded-lg font-mono text-xs overflow-x-auto custom-scrollbar shadow-inner">{{ currentQuestions[currentQIndex].sampleInput }}</pre></div></div>
                                         <div><h4 class="font-bold text-sm text-slate-700 mb-2 border-l-4 border-slate-500 pl-2">输出样例</h4><pre class="bg-[#1e1e1e] text-slate-200 p-3 rounded-lg font-mono text-xs overflow-x-auto custom-scrollbar shadow-inner">{{ currentQuestions[currentQIndex].sampleOutput }}</pre></div>
                                     </div>
                                </div>
                                <div class="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-inner mt-2">
                                    <div class="size-16 bg-white rounded-full flex items-center justify-center text-indigo-500 text-3xl shadow-sm mb-4"><i class="fa-solid fa-code"></i></div>
                                    <h3 class="text-slate-800 font-bold mb-2">编程题作答</h3>
                                    <p class="text-slate-500 text-xs mb-6 max-w-md">本题需要编写完整代码，请点击下方按钮打开专业的编程工作台进行作答与调试。</p>
                                    <div class="flex gap-4">
                                        <button @click="$emit('open-problem', currentQuestions[currentQIndex])" class="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition flex items-center gap-2"><i class="fa-solid fa-terminal"></i> 打开编程工作台</button>
                                        <button v-if="currentMode === 'study'" @click="showAnalysis[currentQuestions[currentQIndex].id] = !showAnalysis[currentQuestions[currentQIndex].id]" class="px-6 py-2.5 rounded-lg border border-slate-200 bg-white text-indigo-600 hover:bg-slate-50 font-bold transition">{{ showAnalysis[currentQuestions[currentQIndex].id] ? '隐藏参考代码' : '查看参考代码' }}</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Analysis Section -->
                        <div v-if="(currentMode === 'study' || currentMode === 'review') && showAnalysis[currentQuestions[currentQIndex].id]" class="mb-8 animate-fade-in">
                            <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
                                <i class="fa-solid fa-lightbulb absolute -right-4 -bottom-4 text-6xl text-indigo-200 opacity-20 rotate-12"></i>
                                <h4 class="font-bold text-indigo-700 text-sm mb-3 flex items-center gap-2 relative z-10"><i class="fa-solid fa-lightbulb"></i> 题目解析</h4>
                                <div class="relative z-10">
                                    <p class="text-xs text-indigo-900 leading-relaxed mb-4 bg-white/50 p-3 rounded-lg border border-indigo-100">{{ currentQuestions[currentQIndex].analysis }}</p>
                                    <div v-if="currentQuestions[currentQIndex].type === 'coding'" class="mt-3"><div class="text-xs font-bold text-slate-500 mb-1">参考代码：</div><pre class="bg-white border border-indigo-100 p-3 rounded-lg text-xs font-mono text-slate-600 overflow-x-auto custom-scrollbar">{{ currentQuestions[currentQIndex].refCode }}</pre></div>
                                    <div v-if="currentMode === 'review' && currentQuestions[currentQIndex].type !== 'coding'" class="mt-2 text-xs text-indigo-600 font-bold">正确答案: {{ ['A', 'B', 'C', 'D'][currentQuestions[currentQIndex].correct] }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Footer Navigation -->
                        <div class="flex justify-between pt-6 border-t border-slate-200">
                            <button @click="prevQuestion" :disabled="currentQIndex === 0" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-bold hover:bg-white hover:shadow-sm disabled:opacity-50 transition">上一题</button>
                            <button @click="nextQuestion" v-if="currentQIndex < currentQuestions.length - 1" class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">下一题</button>
                            <button @click="submitPractice(false)" v-else-if="currentMode !== 'review'" class="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition">提交试卷</button>
                            <button @click="exitPractice" v-else class="px-4 py-2 rounded-lg bg-slate-600 text-white text-sm font-bold hover:bg-slate-700 shadow-lg shadow-slate-200 transition">返回成绩单</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. 成绩单界面 -->
        <div v-else-if="practiceView === 'summary'" class="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center p-6 animate-scale-in">
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full border border-slate-200">
                <div class="text-center mb-10">
                    <div class="inline-block p-4 rounded-full bg-indigo-50 mb-4"><i class="fa-solid fa-trophy text-4xl text-indigo-500"></i></div>
                    <h2 class="text-2xl font-bold text-slate-800">{{ selectedPractice.title }} - 练习报告</h2>
                    <p class="text-slate-500 text-sm mt-2">提交时间：{{ new Date().toLocaleString() }}</p>
                </div>
                <div class="grid grid-cols-3 gap-8 mb-10 text-center">
                    <div class="p-6 bg-slate-50 rounded-xl border border-slate-100"><div class="text-slate-500 text-xs font-bold uppercase mb-2">总得分</div><div class="text-5xl font-extrabold text-indigo-600">{{ examResult.totalScore }} <span class="text-lg text-slate-400 font-normal">/ {{ examResult.maxScore }}</span></div></div>
                    <div class="p-6 bg-slate-50 rounded-xl border border-slate-100"><div class="text-slate-500 text-xs font-bold uppercase mb-2">总用时</div><div class="text-3xl font-bold text-slate-700 font-mono mt-2">{{ Math.floor(examResult.timeUsed / 60) }}分{{ examResult.timeUsed % 60 }}秒</div></div>
                    <div class="p-6 bg-slate-50 rounded-xl border border-slate-100"><div class="text-slate-500 text-xs font-bold uppercase mb-2">击败用户</div><div class="text-3xl font-bold text-emerald-600 mt-2">85%</div></div>
                </div>
                <div class="mb-10">
                    <h3 class="font-bold text-slate-700 mb-4">题型得分详情</h3>
                    <div class="space-y-4">
                        <div v-for="(stat, name) in examResult.sections" :key="name" class="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 transition">
                            <div class="w-24 font-bold text-slate-700">{{ name }}</div>
                            <div class="flex-1">
                                <div class="flex justify-between text-xs mb-1"><span class="text-slate-500">正确率: {{ stat.total ? Math.round(stat.correct / stat.total * 100) : 0 }}% ({{ stat.correct }}/{{ stat.total }})</span><span class="font-bold text-indigo-600">{{ stat.score }} / {{ stat.maxScore }} 分</span></div>
                                <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-indigo-500 rounded-full transition-all duration-1000" :style="{ width: (stat.total ? (stat.correct / stat.total * 100) : 0) + '%' }"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-center gap-4">
                    <button @click="exitSummary" class="px-8 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition">返回大厅</button>
                    <button @click="viewAnalysis" class="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">查看解析</button>
                </div>
            </div>
        </div>

        <!-- 1. 选择练习模式弹窗 -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="showModeSelectModal" class="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="showModeSelectModal = false">
                    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl animate-scale-in relative border border-white/20">
                        <button @click="showModeSelectModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                        <div class="text-center mb-8"><h3 class="text-2xl font-bold text-slate-800 mb-2">选择练习模式</h3><p class="text-slate-500">为 "{{ selectedPractice?.title }}" 选择一个挑战方式</p></div>
                        <div class="grid grid-cols-3 gap-6">
                            <div @click="startPractice('study')" class="border-2 border-indigo-100 bg-indigo-50/30 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:shadow-lg transition group">
                                <div class="size-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition"><i class="fa-solid fa-book-open"></i></div>
                                <h4 class="font-bold text-slate-800 mb-2">看题学习</h4><p class="text-xs text-slate-500 leading-relaxed">每做一题立即显示答案与解析，适合初学和复习。</p>
                            </div>
                            <div @click="startPractice('mock')" class="border-2 border-blue-100 bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:shadow-lg transition group">
                                <div class="size-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition"><i class="fa-solid fa-pen-ruler"></i></div>
                                <h4 class="font-bold text-slate-800 mb-2">模拟考试</h4><p class="text-xs text-slate-500 leading-relaxed">不限时间，但不显示答案，交卷后统一判分。</p>
                            </div>
                            <div @click="startPractice('timed')" class="border-2 border-rose-100 bg-rose-50/30 rounded-xl p-6 text-center cursor-pointer hover:border-rose-500 hover:shadow-lg transition group">
                                <div class="size-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-rose-600 group-hover:text-white transition"><i class="fa-solid fa-stopwatch"></i></div>
                                <h4 class="font-bold text-slate-800 mb-2">限时完成</h4><p class="text-xs text-slate-500 leading-relaxed">严格倒计时限制 ({{ selectedPractice?.timeLimit }}分钟)，模拟真实考场压力。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- 2. 专属考场验证弹窗 -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="showPrivateModal" class="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center" @click.self="showPrivateModal = false">
                    <div class="bg-white rounded-xl shadow-2xl p-6 w-96 animate-scale-in border border-white/20">
                        <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><i class="fa-solid fa-lock text-slate-500"></i> 专属考场验证</h3>
                        <p class="text-sm text-slate-500 mb-4">请输入考试邀请码进入。</p>
                        <input type="password" v-model="privateCode" @keyup.enter="confirmPrivateCode" class="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 mb-4 outline-none focus:border-indigo-500 transition text-center tracking-widest font-mono text-lg" placeholder="输入邀请码">
                        <div class="flex gap-3">
                            <button @click="showPrivateModal = false" class="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition">取消</button>
                            <button @click="confirmPrivateCode" class="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 text-xs transition">验证并进入</button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- 3. 进入考场确认弹窗 -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="showExamConfirmModal" class="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center" @click.self="showExamConfirmModal = false">
                    <div class="bg-white rounded-xl shadow-2xl p-6 w-96 animate-scale-in text-center border border-white/20 relative">
                        <div class="size-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 text-2xl"><i class="fa-solid fa-file-signature"></i></div>
                        <h3 class="text-lg font-bold text-slate-800 mb-2">进入考场</h3>
                        <div class="text-slate-500 text-sm mb-6 space-y-1"><p>即将进入 <span class="font-bold text-slate-700">"{{ selectedExam?.title }}"</span></p><p>考试时长: <span class="font-mono font-bold text-slate-700">{{ selectedExam?.duration }}</span> 分钟</p><p class="text-rose-500 text-xs pt-2"><i class="fa-solid fa-triangle-exclamation"></i> 系统将进入全屏专注模式，请勿切屏。</p></div>
                        <div class="flex gap-3 justify-center">
                            <button @click="showExamConfirmModal = false" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold flex-1 transition">取消</button>
                            <button @click="realStartExam" class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-bold shadow-lg shadow-indigo-200 flex-1 transition">立即进入</button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

    </div>
    `
    ,

    setup(props, { emit }) {
        const { ref } = Vue;
        const currentTab = ref('exam'); 
        const startPracticeRef = ref(null); 

        // 1. 初始化历史逻辑
        const historyLogic = useHistoryLogic(props.user, emit);

        // 2. 初始化练习逻辑，并传入 historyLogic 的 addRecord 方法，形成数据闭环
        const practiceLogic = usePracticeLogic(props.user, emit, historyLogic.addRecord);
        
        // 3. 将练习逻辑的 startPractice 暴露给考试逻辑
        startPracticeRef.value = practiceLogic.startPractice;

        // 4. 将练习逻辑的 loadSession 暴露给组件，供历史记录调用
        const handleViewRecord = (record) => {
             practiceLogic.loadSession(record);
        };

        const examLogic = useExamLogic(props.user, emit, startPracticeRef);

        return {
            currentTab,
            handleViewRecord, // Export handle
            ...examLogic,
            ...practiceLogic,
            ...historyLogic
        };
    }
};

window.ExamCenterFeature = ExamCenterFeature;