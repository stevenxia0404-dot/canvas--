import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 数据库：22种核心物料 (ID与文件名对应)
// ==========================================
const INGREDIENTS = [
  { id: 'ice', name: '冰块', color: 'bg-cyan-200' },
  { id: 'gin', name: '金酒', color: 'bg-gray-100' },
  { id: 'tonic', name: '汤力水', color: 'bg-blue-300' },
  { id: 'lemon_slice', name: '柠檬片', color: 'bg-yellow-300' },
  { id: 'stirrer', name: '搅拌棒', color: 'bg-amber-900' },
  { id: 'shaker', name: '调酒壶', color: 'bg-slate-400' },
  { id: 'lemon_juice', name: '柠檬汁', color: 'bg-yellow-200' },
  { id: 'sugar', name: '砂糖', color: 'bg-white' },
  { id: 'long_glass', name: '长饮杯', color: 'bg-sky-100' },
  { id: 'rocks_glass', name: '古典杯', color: 'bg-stone-300' },
  { id: 'champagne_glass', name: '香槟杯', color: 'bg-yellow-50' },
  { id: 'soda', name: '苏打水', color: 'bg-cyan-400' },
  { id: 'rum', name: '朗姆酒', color: 'bg-amber-700' },
  { id: 'cola', name: '可乐', color: 'bg-stone-900' },
  { id: 'vodka', name: '伏特加', color: 'bg-blue-100' },
  { id: 'orange_juice', name: '鲜橙汁', color: 'bg-orange-500' },
  { id: 'ginger_ale', name: '干姜水', color: 'bg-amber-300' },
  { id: 'lemon_wedge', name: '柠檬角', color: 'bg-yellow-500' },
  { id: 'coffee_liqueur', name: '咖啡酒', color: 'bg-neutral-800' },
  { id: 'cherry', name: '樱桃', color: 'bg-red-600' },
  { id: 'milk', name: '牛奶', color: 'bg-slate-50' },
  { id: 'champagne', name: '香槟', color: 'bg-yellow-100' }
];

// ==========================================
// 判定逻辑：补全英文名，保持载杯独立方案
// ==========================================
const MISSIONS = [
  { id: 'm1', name: '金汤力', enName: 'Gin Tonic', variants: [{ glass: 'long_glass', seq: 'ice,gin,tonic,lemon_slice,stirrer' }], desc: '理智 +20, 疲劳 -50' },
  { id: 'm2', name: '汤姆卡林', enName: 'Tom Collins', variants: [{ glass: 'long_glass', seq: 'shaker,ice,gin,lemon_juice,sugar,ice,soda,lemon_slice,stirrer' }], desc: '魅力 +15, 醉意 +5' },
  { id: 'm3', name: '自由古巴', enName: 'Cuba Libra', variants: [{ glass: 'long_glass', seq: 'ice,rum,cola,lemon_slice,stirrer' }], desc: '热情奔放！移速 +30%' },
  { id: 'm4', name: '螺丝钻', enName: 'Screwdriver', variants: [{ glass: 'long_glass', seq: 'ice,vodka,orange_juice,lemon_slice,stirrer' }, { glass: 'rocks_glass', seq: 'ice,vodka,orange_juice,lemon_slice' }], desc: '攻击力 +15, 准度 -10' },
  { id: 'm5', name: '绝对干姜', enName: 'Absolute Ginger Ale', variants: [{ glass: 'long_glass', seq: 'ice,vodka,ginger_ale,lemon_wedge,stirrer' }], desc: '火抗 +50, 精神大振！' },
  { id: 'm6', name: '绝对汤力', enName: 'Absolute Tonic', variants: [{ glass: 'long_glass', seq: 'ice,vodka,tonic,lemon_wedge,stirrer' }], desc: '隐蔽度 +20, 纯粹打击！' },
  { id: 'm7', name: '黑俄罗斯', enName: 'Black Russian', variants: [{ glass: 'rocks_glass', seq: 'ice,vodka,coffee_liqueur,cherry' }], desc: '暗夜视力 +100, 危险警告' },
  { id: 'm8', name: '白俄罗斯', enName: 'White Russian', variants: [{ glass: 'rocks_glass', seq: 'ice,vodka,coffee_liqueur,milk,cherry' }], desc: 'HP缓慢回复, 防御 +15' },
  { id: 'm9', name: '含羞草', enName: 'Mimosa', variants: [{ glass: 'champagne_glass', seq: 'champagne,orange_juice' }], desc: '社交值 MAX, 幸运 +99' }
];

const BRIEFING_TEXT = `=========================================
[ 绝密简报：核心配方与载杯 ]
=========================================
> 考核已锁定。请严格记忆制作方法、物料顺序与载杯。
> 提醒：载杯置入不限顺序，但物料添加必须严格遵循操作流！

01. 金 汤 力: 长饮杯 | 冰块, 金酒, 汤力水, 柠檬片, 搅拌棒
02. 汤姆卡林: 长饮杯 | 调酒壶, 冰块, 金酒, 柠檬汁, 砂糖, 冰块, 苏打水, 柠檬片, 搅拌棒
03. 自由古巴: 长饮杯 | 冰块, 朗姆酒, 可乐, 柠檬片, 搅拌棒
04. 螺 丝 钻: 
    - 方案A (长饮杯): 冰块, 伏特加, 橙汁, 柠檬片, 搅拌棒
    - 方案B (古典杯): 冰块, 伏特加, 橙汁, 柠檬片
05. 绝对干姜: 长饮杯 | 冰块, 伏特加, 干姜水, 柠檬角, 搅拌棒
06. 绝对汤力: 长饮杯 | 冰块, 伏特加, 汤力水, 柠檬角, 搅拌棒
07. 黑俄罗斯: 古典杯 | 冰块, 伏特加, 咖啡酒, 樱桃
08. 白俄罗斯: 古典杯 | 冰块, 伏特加, 咖啡酒, 牛奶, 樱桃
09. 含 羞 草: 香槟杯 | 香槟, 橙汁
=========================================`;

// ==========================================
// 通用组件：简报弹窗
// ==========================================
function BriefingModal({ onClose }) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#131313] border-4 border-[#3e4451] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col overflow-hidden animate-[cert-pop_0.2s_ease-out]">
        <div className="bg-[#1e222a] border-b-2 border-[#3e4451] px-4 py-2 flex justify-between items-center">
          <span className="text-[#e5c07b] font-black tracking-widest text-xs md:text-sm">[ SYSTEM ARCHIVE / 系统档案 ]</span>
          <button onClick={onClose} className="text-[#e06c75] font-black hover:text-white transition-colors shrink-0 whitespace-nowrap">[ X ] CLOSE</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh] text-[#abb2bf] whitespace-pre-wrap font-bold leading-relaxed text-sm md:text-base custom-scrollbar text-left">
          <span className="text-[#d19a66] font-black">[ 绝密简报：核心配方 ]</span>
          {BRIEFING_TEXT.replace(/\[ 绝密简报：核心配方与载杯 \]/, '')}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 组件：Node 1 终端登录 (替换专属欢迎词)
// ==========================================
function TerminalLogin({ onComplete, isAudioOn, toggleAudio, toggleBriefing, onSecretClick }) {
  const [step, setStep] = useState(0);
  const [terminalHistory, setTerminalHistory] = useState('');
  const [typingText, setTypingText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [formData, setFormData] = useState({ name: '', empId: '', dept: '' });
  const [countdown, setCountdown] = useState(30);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (typingIndex < typingText.length) {
      const timeout = setTimeout(() => setTypingIndex(prev => prev + 1), 20);
      return () => clearTimeout(timeout);
    } else if (typingText.length > 0) {
      const completedText = typingText;
      setTerminalHistory(prev => prev + completedText);
      setTypingText('');
      setTypingIndex(0);
      if (step === 0) setStep(1);
      if (step === 3) setStep(4);
      if (step === 5) setStep(6);
    }
  }, [typingIndex, typingText, step]);

  useEffect(() => {
    setTypingText(`CLOUD SECRET AGENT ACADEMY
INITIALIZING SYSTEM...
MEMORY CHECK: 640K OK
ESTABLISHING SECURE UPLINK... DONE

> 欢迎来到云端特勤局学院终端。
> 请输入您的学员信息以启动系统...\n\n`);
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory, typingIndex, step]);

  useEffect(() => {
    let timer;
    if ((step === 5 || step === 6) && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0 && (step === 5 || step === 6)) {
      onComplete(formData);
    }
    return () => clearInterval(timer);
  }, [step, countdown, formData, onComplete]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setStep(2);
    setTerminalHistory(prev => prev + `[ INPUT DATA ]\n姓　　名: ${formData.name}\n员工编号: ${formData.empId}\n所属部门: ${formData.dept}\n\n[ IDENTITY CONFIRMED ]\n\n`);
    setTimeout(() => {
      setStep(3);
      // 精准替换为用户提供的三万英尺高空欢迎词
      setTypingText(`> 身份验证通过。欢迎归队，特工 ${formData.name}。
> 你的专属战场在三万英尺的高空，而“云端特勤局学院”是你淬炼顶尖技能的唯一基地。
> 在这里，每一次飞行任务不仅依靠硬核的安全守卫，更取决于你对机舱后勤与专业呈现的绝对掌控。
> 
> 特勤局刚刚截获了最新的情报：随着洲际航线任务的升级，目标人物对客舱餐饮的标准已提升至 S 级。你目前的优先级任务，是彻底攻克【CLOUD LOUNGE云端酒廊】的通关考核。
> 
> 请记住，特工 ${formData.name}。在这片云端战场上，冰块的比例、基酒的选择、甚至一根搅拌棒的放置顺序，都可能决定一次任务的完美成败。
> 你没有在客舱里翻阅手册的时间，一切配方必须化为你的肌肉记忆。
> 
> 接下来系统将为你下发本次行动的绝密配方简报。祝你好运！！！\n\n`);
    }, 1000);
  };

  const formatText = (text) => {
    if (!text) return { __html: '' };
    return { __html: text
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^&gt;/gm, '<span class="text-[#c678dd] font-black">&gt;</span>') 
      .replace(/\[ 绝密简报：核心配方 \]/g, '<span class="text-[#d19a66] font-black">[ 绝密简报：核心配方 ]</span>')
      .replace(/\[ AUDIO ENGINE ACTIVATED \]/g, '<span class="text-[#98c379] font-black">[ AUDIO ENGINE ACTIVATED ]</span>')
      .replace(/\[ IDENTITY CONFIRMED \]/g, '<span class="text-[#98c379] font-black">[ IDENTITY CONFIRMED ]</span>')
    };
  };

  return (
    <div className="w-full max-w-4xl bg-[#131313] p-2 md:p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative z-10 border-b-8 border-r-8 border-black flex flex-col h-[90vh]">
      <div className="bg-[#0a0a0a] w-full flex-grow rounded-2xl p-4 md:p-8 shadow-[inset_0_0_80px_rgba(0,0,0,1)] overflow-hidden relative border-4 border-gray-800 flex flex-col">
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px] z-40"></div>
        <div className="relative z-20 text-[#abb2bf] whitespace-pre-wrap break-words text-sm md:text-xl font-bold leading-relaxed tracking-wide flex-grow overflow-y-auto pr-2 custom-scrollbar text-left">
          <span dangerouslySetInnerHTML={formatText(terminalHistory)} />
          <span dangerouslySetInnerHTML={formatText(typingText.slice(0, typingIndex))} />
          
          {step === 1 && (
            <div className="mt-6 border-2 border-gray-700 p-4 md:p-6 max-w-md relative bg-gray-900/50">
               <div className="absolute -top-4 left-4 bg-gray-800 px-2 text-[#e5c07b] font-extrabold tracking-widest text-xs border-2 border-gray-700">[ ACADEMY DATA ]</div>
               <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
                <div className="flex items-center border-b border-gray-700/50 pb-1">
                  <span className="w-20 md:w-28 text-[#56b6c2] text-sm">姓　　名:</span><span className="mr-2 text-[#c678dd]">{">"}</span>
                  <input required value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} autoFocus className="bg-transparent border-none outline-none text-[#98c379] flex-grow uppercase font-extrabold" />
                </div>
                <div className="flex items-center border-b border-gray-700/50 pb-1">
                  <span className="w-20 md:w-28 text-[#56b6c2] text-sm">员工编号:</span><span className="mr-2 text-[#c678dd]">{">"}</span>
                  <input required value={formData.empId} onChange={(e)=>setFormData({...formData, empId: e.target.value})} className="bg-transparent border-none outline-none text-[#98c379] flex-grow uppercase font-extrabold" />
                </div>
                <div className="flex items-center border-b border-gray-700/50 pb-1">
                  <span className="w-20 md:w-28 text-[#56b6c2] text-sm">所属部门:</span><span className="mr-2 text-[#c678dd]">{">"}</span>
                  <input required value={formData.dept} onChange={(e)=>setFormData({...formData, dept: e.target.value})} className="bg-transparent border-none outline-none text-[#98c379] flex-grow uppercase font-extrabold" />
                </div>
                <button type="submit" className="mt-4 px-4 py-2 border-2 border-[#e5c07b] text-[#e5c07b] font-bold hover:bg-[#e5c07b] hover:text-black transition-all shadow-[4px_4px_0_#9a8153] active:translate-y-1 active:shadow-none animate-pulse">[ 登 录 SYSTEM ]</button>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="flex justify-end mt-4">
               <button onClick={()=>{setStep(5); setTypingText(BRIEFING_TEXT+'\n\n');}} className="px-6 py-3 border-2 border-[#98c379] text-[#98c379] font-black text-lg hover:bg-[#98c379] hover:text-black shadow-[4px_4px_0_#658550] animate-pulse transition-all">[ 接收 / ACCEPT ]</button>
            </div>
          )}

          <span className={`inline-block w-3 h-5 md:h-6 bg-[#abb2bf] align-middle shadow-[0_0_8px_rgba(171,178,191,0.6)] ${step === 1 || step === 4 || step === 6 ? 'animate-pulse' : ''}`}></span>
          <div ref={terminalEndRef} className="h-8"></div>
        </div>

        <div className="absolute bottom-4 right-4 z-50 flex items-center gap-4">
          {(step === 5 || step === 6) && (
            <>
              <div className="text-[#e06c75] text-lg md:text-2xl font-black animate-pulse bg-[#1e222a] px-4 py-2 border-2 border-gray-700 shadow-[4px_4px_0_#8c383e]">T-{countdown.toString().padStart(2, '0')}s</div>
              <button onClick={() => onComplete(formData)} className="px-6 py-3 border-2 border-[#56b6c2] text-[#56b6c2] font-extrabold text-lg hover:bg-[#56b6c2] hover:text-black shadow-[4px_4px_0_#3a7a82] active:translate-y-1 active:shadow-none transition-all">[ 开始任务 / START ]</button>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 md:mt-4 flex justify-between items-center px-4 shrink-0 overflow-hidden">
        <div className="text-gray-500 font-extrabold tracking-widest text-[10px] md:text-sm italic">CLOUD SECRET AGENT <span className="text-[#5c6370] ml-1 font-black text-[9px]">云端特勤局</span></div>
        <div className="flex space-x-3 items-center">
          <button onClick={toggleBriefing} className="shrink-0 px-2 py-1 text-[10px] font-bold border border-gray-600 bg-gray-800 text-[#56b6c2] rounded shadow-[1px_1px_0_#2b5b61] active:translate-y-px">[ 📜 简报 ]</button>
          <button onClick={toggleAudio} className={`shrink-0 px-2 py-1 text-[10px] font-bold border border-gray-600 bg-gray-800 text-[#98c379] rounded active:translate-y-px ${isAudioOn ? 'shadow-[1px_1px_0_#3e4c36]' : 'opacity-50'}`}>{isAudioOn ? '[ 🎵 ON ]' : '[ 🔇 OFF ]'}</button>
          <div onClick={onSecretClick} className="flex space-x-2 items-center cursor-default ml-2">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-500 border border-black shadow-inner"></div>
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#e5c07b] border border-black shadow-inner"></div>
            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#98c379] shadow-[0_0_10px_#98c379] animate-pulse`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 组件：Node 2 任务大厅 (加入中英双语版式)
// ==========================================
function MissionHall({ missions, onSelectMission, isAudioOn, toggleAudio, toggleBriefing, missionResults, flippedMissions, setFlippedMissions, onSecretClick }) {
  const activeIndex = missions.findIndex(m => missionResults[m.id] !== 'PASS');
  const finalActiveIndex = activeIndex === -1 ? missions.length : activeIndex;

  return (
    <div className="w-full max-w-5xl bg-[#131313] p-2 md:p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative z-10 border-b-8 border-r-8 border-black flex flex-col h-[90vh]">
      <div className="bg-[#0a0a0a] w-full flex-grow rounded-2xl p-3 md:p-6 shadow-[inset_0_0_80px_rgba(0,0,0,1)] overflow-hidden relative border-4 border-gray-800 flex flex-col">
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px] z-40"></div>
        <div className="relative z-20 mb-3 md:mb-4 border-b-2 border-[#3e4451] pb-2 text-left">
          <h1 className="text-[#56b6c2] text-lg md:text-2xl font-black tracking-widest uppercase">[ DATABASE / 任务大厅 ]</h1>
        </div>
        <div className="relative z-20 flex-1 grid grid-cols-3 gap-2 md:gap-4 overflow-hidden">
          {missions.map((mission, index) => {
            const isFlipped = flippedMissions.includes(mission.id);
            const status = missionResults[mission.id]; 
            const isLocked = index > finalActiveIndex; 
            return (
              <div key={mission.id} onClick={() => !isLocked && (isFlipped ? onSelectMission(mission) : setFlippedMissions([...flippedMissions, mission.id]))} className={`perspective w-full h-full ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group'}`}>
                <div className={`w-full h-full relative preserve-3d transition-transform duration-500 ease-out ${isFlipped ? 'rotate-y-180' : ''}`}>
                  
                  {/* 未翻开：LOCKED 或 CLASSIFIED */}
                  <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#2c313c] to-[#1e222a] rounded-xl md:rounded-[2rem] border border-[#3e4451]/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
                    <div className="w-8 h-8 md:w-14 md:h-14 rounded-full border-[2px] md:border-[3px] border-[#56b6c2]/40 flex items-center justify-center mb-1 bg-[#131313]/50 shadow-inner">
                      <span className="text-[#56b6c2]/60 text-lg md:text-2xl font-black">{isLocked ? 'X' : '?'}</span>
                    </div>
                    <div className="text-gray-500 text-[9px] md:text-xs font-bold tracking-widest uppercase">{isLocked ? 'LOCKED' : 'CLASSIFIED'}</div>
                  </div>
                  
                  {/* 已翻开：中英双语版式 */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#1e222a] rounded-xl md:rounded-[2rem] border-2 border-[#56b6c2]/40 shadow-inner flex flex-col items-center justify-center p-2">
                    <span className="text-[#e5c07b] font-black text-sm md:text-2xl text-center leading-tight break-words flex flex-col gap-0.5">
                       {mission.name}
                       <span className="text-[8px] md:text-xs text-gray-500 font-bold uppercase tracking-widest leading-none">{mission.enName}</span>
                    </span>
                    {status && <div className={`absolute bottom-2 right-2 border-2 rounded px-1 py-0.5 font-black text-[8px] md:text-xs -rotate-12 ${status === 'PASS' ? 'text-[#388e3c] border-[#388e3c]' : 'text-[#d32f2f] border-[#d32f2f]'}`}>{status}</div>}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 md:mt-4 flex justify-between items-center px-4 shrink-0 overflow-hidden">
        <div className="text-gray-500 font-extrabold tracking-widest text-[10px] md:text-sm italic">CLOUD SECRET AGENT <span className="text-[#5c6370] ml-1 font-black text-[9px]">云端特勤局</span></div>
        <div className="flex space-x-3 items-center">
          <button onClick={toggleBriefing} className="shrink-0 px-2 py-1 text-[10px] font-bold border border-gray-600 bg-gray-800 text-[#56b6c2] rounded shadow-[1px_1px_0_#2b5b61] active:translate-y-px">[ 📜 简报 ]</button>
          <button onClick={toggleAudio} className={`shrink-0 px-2 py-1 text-[10px] font-bold border border-gray-600 bg-gray-800 text-[#98c379] rounded active:translate-y-px ${isAudioOn ? 'shadow-[1px_1px_0_#3e4c36]' : 'opacity-50'}`}>{isAudioOn ? '[ 🎵 ON ]' : '[ 🔇 OFF ]'}</button>
          <div onClick={onSecretClick} className="flex space-x-2 items-center cursor-default ml-2">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gray-500 border border-black shadow-inner"></div>
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#e5c07b] border border-black shadow-inner"></div>
            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#98c379] shadow-[0_0_10px_#98c379] animate-pulse`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 组件：Node 3 操作台
// ==========================================
function Workspace({ agentData, currentMission, onBack, onMissionComplete, isAudioOn, toggleAudio, toggleBriefing, onSecretClick }) {
  const activeMission = currentMission || { id: 'dev', name: 'DEV', variants: [{glass:'long_glass',seq:'ice'}] };
  const [glassContents, setGlassContents] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [resultMsg, setResultMsg] = useState(`特工准备就绪。\n调制【${activeMission.name}】`);
  const [isMixed, setIsMixed] = useState(false);
  const [stampStatus, setStampStatus] = useState(null); 
  const MAX_CAPACITY = 12;

  const handleAddIngredient = (ingredient) => {
    if (isMixed) return; 
    if (glassContents.length < MAX_CAPACITY) {
      setGlassContents([...glassContents, ingredient]);
      setResultMsg('添加了: ' + ingredient.name);
    } else {
      setResultMsg('警告：容量已达极限！');
    }
  };

  const handleShake = () => {
    if (glassContents.length === 0) return setResultMsg('系统提示：容器空空如也！');
    setIsShaking(true); setResultMsg('系统正在比对配方特征序列...\n[ PROCESSING ]');
    setTimeout(() => {
      setIsShaking(false); setIsMixed(true);
      const glassTypes = ['long_glass', 'rocks_glass', 'champagne_glass'];
      const userGlasses = [...new Set(glassContents.filter(i => glassTypes.includes(i.id)).map(i => i.id))];
      const userSeq = glassContents.filter(i => !glassTypes.includes(i.id)).map(i => i.id).join(',');
      
      let isPass = false;
      for (const variant of activeMission.variants) {
         if (userGlasses.length === 1 && userGlasses[0] === variant.glass && userSeq === variant.seq) {
             isPass = true; break;
         }
      }
      if (isPass) {
        setResultMsg(`【${activeMission.name}】\n验证通过。`);
        setStampStatus('PASS'); onMissionComplete(activeMission.id, 'PASS'); 
      } else {
        setResultMsg('【失败】\n操作顺序或载杯错误。');
        setStampStatus('FAIL'); onMissionComplete(activeMission.id, 'FAIL'); 
      }
    }, 1500);
  };

  const stackedContents = glassContents.reduce((acc, curr) => {
    if (acc.length > 0 && acc[acc.length - 1].id === curr.id) { acc[acc.length - 1].count += 1; } 
    else { acc.push({ ...curr, count: 1 }); }
    return acc;
  }, []);

  return (
    <div className="w-full max-w-5xl bg-[#131313] border-b-8 border-r-8 border-black rounded-[2rem] p-3 md:p-8 flex flex-col relative shadow-[0_20px_50px_rgba(0,0,0,0.9)] h-[90vh] md:h-[94vh] overflow-hidden text-left">
      <div className="absolute top-0 left-0 w-full h-10 md:h-12 bg-[#1e222a] border-b-4 border-[#0a0a0a] rounded-t-[2rem] flex items-center px-4 md:px-8 justify-between -mt-1 z-50">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onBack} className="text-[#e06c75] font-black hover:text-white transition-colors active:scale-95 text-sm md:text-base">[ &lt; BACK ]</button>
          <span className="text-[#56b6c2] font-bold tracking-widest text-[10px] md:text-sm uppercase truncate">TARGET: {activeMission.name}</span>
        </div>
        <div onClick={onSecretClick} className="flex gap-2 shrink-0 cursor-default">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-500 border border-black rounded-full"></div>
          <div className="w-3 h-3 md:w-4 md:h-4 bg-[#e5c07b] border border-black rounded-full"></div>
          <div className="w-3 h-3 md:w-4 md:h-4 bg-[#e06c75] border border-black rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="mt-8 md:mt-10 flex-1 flex flex-col md:flex-row gap-3 md:gap-8 min-h-0 relative z-10 overflow-hidden">
        {stampStatus && (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
            <div className={`stamp border-[8px] rounded-xl px-8 py-4 font-black tracking-widest opacity-90 backdrop-blur-md bg-black/20 ${stampStatus === 'PASS' ? 'text-[#388e3c] border-[#388e3c]' : 'text-[#d32f2f] border-[#d32f2f]'}`}>
              <span className="text-6xl md:text-8xl mix-blend-normal uppercase">{stampStatus}</span>
            </div>
          </div>
        )}

        <div className="w-full md:w-1/3 flex flex-col items-center justify-start h-[35%] md:h-auto shrink-0">
          <div className="w-full bg-[#0a0a0a] border-4 border-[#3e4451] rounded-lg mb-4 p-2 shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]"></div>
            <p className="text-[#98c379] whitespace-pre-line leading-snug h-10 md:h-16 flex items-center justify-center text-center font-bold text-[10px] md:text-base">{resultMsg}</p>
          </div>
          <div className={`relative w-24 h-32 md:w-36 md:h-64 border-x-[6px] md:border-x-8 border-b-[6px] md:border-b-8 border-[#3e4451] rounded-b-xl flex flex-col-reverse bg-white/5 transition-transform ${isShaking ? 'animate-pixel-shake' : ''}`}>
            {stackedContents.map((ing, index) => (
              <div key={index} style={{ flexGrow: ing.count }} className={`w-full ${ing.color} border-t-2 border-black/30 flex items-center justify-center relative overflow-hidden transition-all`}>
                <img src={`/assets/${ing.id}.png`} className="absolute w-[80%] h-[80%] object-contain z-10" style={{ imageRendering: 'pixelated' }} alt={ing.name} onError={(e)=>e.target.style.display='none'} />
                {ing.count > 1 && <span className="absolute z-20 text-white font-black text-[10px] md:text-sm drop-shadow-[0_2px_2px_#000]">x{ing.count}</span>}
              </div>
            ))}
            {isMixed && <div className="absolute inset-0 bg-black/30 mix-blend-multiply z-15 pointer-events-none"></div>}
          </div>
          <div className="w-32 h-2 md:w-48 md:h-4 bg-[#282c34] border-[3px] md:border-4 border-[#0a0a0a] mt-1 md:mt-2 shadow-[3px_3px_0_0_#000] rounded-sm"></div>
        </div>

        <div className="flex-1 flex flex-col gap-3 md:gap-4 min-h-0">
          <div className="bg-[#1e222a] border-4 border-[#3e4451] p-2 md:p-4 flex-grow flex flex-col overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] rounded-lg text-left">
            <h2 className="text-[#56b6c2] font-black mb-2 border-b-2 border-[#3e4451] pb-1 uppercase text-xs md:text-base">[ REPOSITORY / 物料 ]</h2>
            <div className="grid grid-cols-4 md:grid-cols-4 gap-1.5 md:gap-2 overflow-y-auto custom-scrollbar h-full">
              {INGREDIENTS.map((item) => (
                <button key={item.id} onClick={() => handleAddIngredient(item)} disabled={glassContents.length >= MAX_CAPACITY || isMixed}
                  className={`relative overflow-hidden ${item.color} border-[1.5px] md:border-2 border-black h-14 md:h-16 w-full p-1 text-[9px] md:text-[11px] font-bold text-center disabled:opacity-30 shadow-[2px_2px_0_0_#000] transition-all hover:brightness-110 active:translate-x-px flex flex-col items-center justify-center gap-0.5`}>
                  <img src={`/assets/${item.id}.png`} alt={item.name} className="h-5 md:h-7 object-contain drop-shadow-md z-10" style={{ imageRendering: 'pixelated' }} onError={(e)=>e.target.style.display='none'} />
                  <span className="relative z-10 text-white font-black drop-shadow-[0_1px_1px_#000] leading-none uppercase">{item.name}</span>
                  <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
                </button>
              ))}
              {Array.from({ length: 24 - INGREDIENTS.length }).map((_, i) => (
                <div key={i} className="bg-[#1e222a] border-[1.5px] md:border-2 border-[#131313] h-14 md:h-16 opacity-30 flex flex-col items-center justify-center gap-0.5">
                   <div className="h-4 w-6 bg-black/20 rounded-sm"></div>
                   <div className="h-2 w-8 bg-black/20 rounded-sm"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex gap-2 md:gap-4">
              <button onClick={handleShake} disabled={isShaking || isMixed || glassContents.length === 0} className="flex-1 bg-[#e06c75] text-white border-2 md:border-4 border-black py-2 md:py-4 font-black text-sm md:text-xl rounded-lg shadow-[3px_3px_0_0_#8c383e] active:translate-x-px">MIX / 混合</button>
              <button onClick={()=>{setGlassContents([]);setIsMixed(false);setStampStatus(null);setResultMsg('已清空。')}} disabled={isShaking} className="flex-1 bg-[#e5c07b] text-black border-2 md:border-4 border-black py-2 md:py-4 font-black text-sm md:text-xl rounded-lg shadow-[3px_3px_0_0_#9a8153] active:translate-x-px">TRASH / 清理</button>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={toggleBriefing} className="shrink-0 px-2 py-1 text-[10px] font-bold border border-gray-600 bg-gray-800 text-[#56b6c2] rounded shadow-[1px_1px_0_#2b5b61] active:translate-y-px">[ 📜 简报 ]</button>
              <button onClick={toggleAudio} className={`shrink-0 px-2 py-1 text-[10px] font-bold border border-gray-600 bg-gray-800 text-[#98c379] rounded active:translate-y-px ${isAudioOn ? 'shadow-[1px_1px_0_#3e4c36]' : 'opacity-50'}`}>{isAudioOn ? '[ 🎵 ON ]' : '[ 🔇 OFF ]'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 组件：Node 4 毕业证书 (精准还原图片设计)
// ==========================================
function Graduation({ agentData, onReset, failCount, onSecretClick }) {
  // 按照截图样式：0次错误为ELITE(粉紫色边框发光)，否则依次降级
  let label = failCount === 0 ? 'ELITE' : (failCount <= 3 ? 'PROFICIENT' : 'QUALIFIED');
  let color = failCount === 0 ? 'text-[#f0abfc]' : (failCount <= 3 ? 'text-[#98c379]' : 'text-[#56b6c2]');
  let boxBorder = failCount === 0 ? 'border-[#d946ef] shadow-[0_0_15px_rgba(217,70,239,0.4)]' : (failCount <= 3 ? 'border-[#98c379] shadow-[0_0_15px_rgba(152,195,121,0.4)]' : 'border-[#56b6c2] shadow-[0_0_15px_rgba(86,182,194,0.4)]');

  return (
    <div className="w-full max-w-2xl bg-[#1a1d24] p-8 md:p-12 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-2 border-[#e5c07b] flex flex-col items-center relative z-10 animate-cert-pop my-auto">
      
      {/* 还原截图中的超大绿色钢印水印 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none z-0">
        <div className="border-[6px] border-[#98c379] rounded-full w-64 h-64 md:w-80 md:h-80 flex flex-col items-center justify-center -rotate-12">
            <span className="text-[#98c379] font-black text-3xl md:text-5xl tracking-widest">OFFICIAL</span>
            <span className="text-[#98c379] font-black text-4xl md:text-6xl tracking-widest mt-1 border-t-4 border-[#98c379] pt-1">PASSED</span>
        </div>
      </div>

      <div onClick={onSecretClick} className="text-4xl md:text-5xl mb-4 z-10 cursor-default">🏅</div>
      <h1 className="text-[#e5c07b] text-3xl md:text-4xl font-black tracking-[0.2em] uppercase z-10 mb-1">CERTIFICATE</h1>
      <h2 className="text-gray-500 text-xs md:text-sm font-bold tracking-widest border-b border-gray-600 pb-4 mb-8 w-full max-w-sm text-center z-10">CLOUD SECRET AGENT ACADEMY</h2>
      
      <p className="text-[#abb2bf] text-sm md:text-base font-bold leading-loose text-center mb-8 z-10">
        经系统核准，特工 <span className="text-[#e5c07b] font-black text-lg md:text-xl border-b border-dashed border-[#e5c07b] px-1">{agentData.name}</span><br/>
        ( ID: {agentData.empId} )<br/>
        <br/>
        已完全掌握所有机密特调配方，<br/>
        且具备执行特勤任务的胜任力。
      </p>
      
      <div className="flex flex-col items-center z-10 mb-8 w-full">
         <span className="text-gray-500 text-[10px] md:text-xs tracking-widest mb-3 uppercase">SYSTEM RATING / 系统评级</span>
         <div className={`px-10 py-3 border-2 ${boxBorder} bg-black/40 backdrop-blur-sm mb-4`}>
            <span className={`${color} font-black text-2xl md:text-4xl tracking-widest drop-shadow-[0_0_10px_currentColor]`}>{label}</span>
         </div>
         <div className="text-gray-400 text-[10px] md:text-xs font-normal">
            特工展现了完美的肌肉记忆，表现卓越。（错误记录: {failCount} 次）
         </div>
      </div>

      <div className="w-full max-w-sm border-t border-gray-800 pt-6 flex justify-center z-10">
        <button onClick={onReset} className="bg-transparent border border-gray-600 text-gray-400 px-6 py-2 text-xs md:text-sm font-bold tracking-widest hover:border-[#e06c75] hover:text-[#e06c75] transition-all">[ SYSTEM REBOOT ]</button>
      </div>
    </div>
  );
}

// ==========================================
// 主应用入口
// ==========================================
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState('terminal');
  const [agentData, setAgentData] = useState({ name: 'UNKNOWN', empId: '', dept: '' });
  const [shuffledMissions, setShuffledMissions] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showBriefing, setShowBriefing] = useState(false);
  const [missionResults, setMissionResults] = useState({}); 
  const [flippedMissions, setFlippedMissions] = useState([]);
  const [failCount, setFailCount] = useState(0);
  const [isDevOpen, setIsDevOpen] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/assets/bgm.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    
    const sData = localStorage.getItem('agentData');
    const sRes = localStorage.getItem('missionResults');
    const sFlip = localStorage.getItem('flippedMissions');
    const sFail = localStorage.getItem('failCount');
    const sShuf = localStorage.getItem('shuffledMissions');

    if (sData) { setAgentData(JSON.parse(sData)); setCurrentView('mission_hall'); }
    if (sRes) setMissionResults(JSON.parse(sRes));
    if (sFlip) setFlippedMissions(JSON.parse(sFlip));
    if (sFail) setFailCount(parseInt(sFail, 10));
    if (sShuf) {
      setShuffledMissions(JSON.parse(sShuf));
    } else {
      const rnd = [...MISSIONS].sort(()=>Math.random()-0.5);
      setShuffledMissions(rnd);
      localStorage.setItem('shuffledMissions', JSON.stringify(rnd));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isAudioOn) { audioRef.current.play().catch(() => setIsAudioOn(false)); } 
    else { audioRef.current.pause(); }
  }, [isAudioOn]);

  useEffect(() => {
    if (agentData.name !== 'UNKNOWN' && isLoaded) {
      localStorage.setItem('agentData', JSON.stringify(agentData));
      localStorage.setItem('missionResults', JSON.stringify(missionResults));
      localStorage.setItem('flippedMissions', JSON.stringify(flippedMissions));
      localStorage.setItem('failCount', failCount.toString());
      if (Object.values(missionResults).filter(r => r === 'PASS').length === 9) {
        if (currentView !== 'graduation') setTimeout(() => setCurrentView('graduation'), 1000);
      }
    }
  }, [agentData, missionResults, flippedMissions, failCount, isLoaded, currentView]);

  if (!isLoaded) return <div className="min-h-screen bg-[#1e222a]" />;

  return (
    <div className="w-full min-h-screen bg-[#1e222a] flex items-center justify-center p-2 md:p-4 custom-terminal-font selection:bg-[#3e4451] selection:text-white relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        /* 彻底覆盖 Vite 默认的 #root 宽度限制和白色背景 */
        html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100vh; background-color: #1e222a; max-width: none !important; }
        
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Noto+Sans+SC:wght@400;700;900&display=swap');
        .custom-terminal-font { font-family: 'JetBrains Mono', 'Noto Sans SC', monospace; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; background: #1e222a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3e4451; border-radius: 4px; }
        @keyframes pixel-shake { 0%{transform:translate(0,0)} 25%{transform:translate(2px,-2px) rotate(1deg)} 50%{transform:translate(-2px,2px)} 100%{transform:translate(0,0)} }
        .animate-pixel-shake { animation: pixel-shake 0.1s infinite; }
        @keyframes stamp-drop { 0%{transform:scale(2);opacity:0} 100%{transform:scale(1) rotate(-12deg);opacity:0.9} }
        .stamp { animation: stamp-drop 0.2s ease-out forwards; }
        @keyframes cert-pop { 0%{transform:scale(1.1);opacity:0} 100%{transform:scale(1);opacity:1} }
        .animate-cert-pop { animation: cert-pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .perspective { perspective: 1000px; } .preserve-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
      
      {showBriefing && <BriefingModal onClose={() => setShowBriefing(false)} />}
      
      {currentView === 'terminal' && <TerminalLogin onComplete={(data)=>{setAgentData(data);setCurrentView('mission_hall');}} isAudioOn={isAudioOn} toggleAudio={()=>setIsAudioOn(!isAudioOn)} toggleBriefing={() => setShowBriefing(true)} onSecretClick={() => setIsDevOpen(true)} />}
      {currentView === 'mission_hall' && <MissionHall missions={shuffledMissions} missionResults={missionResults} flippedMissions={flippedMissions} setFlippedMissions={setFlippedMissions} onSelectMission={(m)=>{setCurrentMission(m);setCurrentView('workspace');}} isAudioOn={isAudioOn} toggleAudio={()=>setIsAudioOn(!isAudioOn)} toggleBriefing={() => setShowBriefing(true)} onSecretClick={() => setIsDevOpen(true)} />}
      {currentView === 'workspace' && <Workspace agentData={agentData} currentMission={currentMission} onBack={()=>setCurrentView('mission_hall')} onMissionComplete={(id,s)=>{setMissionResults(p=>({...p,[id]:s})); if(s==='FAIL')setFailCount(c=>c+1)}} isAudioOn={isAudioOn} toggleAudio={()=>setIsAudioOn(!isAudioOn)} toggleBriefing={() => setShowBriefing(true)} onSecretClick={() => setIsDevOpen(true)} />}
      {currentView === 'graduation' && <Graduation agentData={agentData} onReset={()=>{localStorage.clear();window.location.reload();}} failCount={failCount} onSecretClick={()=>setIsDevOpen(true)} />}

      {isDevOpen && (
        <div className="fixed bottom-10 right-4 z-[999] bg-black border border-red-500 p-3 rounded text-[10px] text-white font-mono shadow-2xl flex flex-col gap-2">
            <div className="flex justify-between border-b border-red-900 pb-1 mb-1">
               <span className="text-red-500">DEBUG CONSOLE</span>
               <button onClick={()=>setIsDevOpen(false)} className="bg-red-900 px-1 rounded hover:bg-red-500">X</button>
            </div>
            <button onClick={()=>setCurrentView('terminal')} className="text-left hover:bg-white/10">&gt; NODE 1 (LOGIN)</button>
            <button onClick={()=>setCurrentView('mission_hall')} className="text-left hover:bg-white/10">&gt; NODE 2 (HALL)</button>
            <button onClick={()=>setCurrentView('workspace')} className="text-left hover:bg-white/10">&gt; NODE 3 (WORKSPACE)</button>
            <button onClick={()=>{setMissionResults(MISSIONS.reduce((acc,m)=>({...acc,[m.id]:'PASS'}), {}));setCurrentView('graduation')}} className="text-left text-[#98c379] hover:bg-white/10">&gt; HACK PASS ALL</button>
            <button onClick={()=>{localStorage.clear();window.location.reload()}} className="text-left text-[#e06c75] hover:bg-white/10">&gt; CLEAR CACHE</button>
        </div>
      )}
    </div>
  );
}