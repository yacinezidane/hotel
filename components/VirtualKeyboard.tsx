
import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { Delete, ChevronDown, Globe, Type, ArrowBigUp, Check, Minus } from 'lucide-react';

interface VirtualKeyboardProps {
    isVisible: boolean;
    onClose: () => void;
    targetInput: HTMLInputElement | HTMLTextAreaElement | null;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ isVisible, onClose, targetInput }) => {
    const { settings } = useHotel();
    const [layout, setLayout] = useState<'ar' | 'en' | 'num'>('ar');
    const [capsLock, setCapsLock] = useState(false);
    const [shift, setShift] = useState(false);

    // FIX: Optimized scroll to show input directly above keyboard without gap
    useEffect(() => {
        if (isVisible && targetInput) {
            // Slight delay to allow keyboard animation to start
            setTimeout(() => {
                targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [isVisible, targetInput]);

    // Layout Definitions
    const layouts = {
        ar: [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
            ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
            ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ', 'ذ']
        ],
        en: [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm']
        ],
        num: [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['.', '0', '-']
        ]
    };

    const triggerInputEvent = (input: HTMLInputElement | HTMLTextAreaElement, newValue: string) => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 
            "value"
        )?.set;
        
        if (nativeInputValueSetter) {
            nativeInputValueSetter.call(input, newValue);
        } else {
            input.value = newValue;
        }

        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
    };

    const handleKeyPress = (key: string) => {
        if (!targetInput) return;

        const start = targetInput.selectionStart || 0;
        const end = targetInput.selectionEnd || 0;
        const value = targetInput.value;
        const newValue = value.substring(0, start) + key + value.substring(end);

        triggerInputEvent(targetInput, newValue);

        targetInput.focus();
        const newCursorPos = start + key.length;
        requestAnimationFrame(() => {
            targetInput.setSelectionRange(newCursorPos, newCursorPos);
        });

        if (shift) setShift(false);
    };

    const handleBackspace = () => {
        if (!targetInput) return;
        const start = targetInput.selectionStart || 0;
        const end = targetInput.selectionEnd || 0;
        const value = targetInput.value;

        if (start === end && start === 0) return;

        let newValue;
        let newCursorPos;

        if (start !== end) {
            newValue = value.substring(0, start) + value.substring(end);
            newCursorPos = start;
        } else {
            newValue = value.substring(0, start - 1) + value.substring(end);
            newCursorPos = start - 1;
        }

        triggerInputEvent(targetInput, newValue);

        targetInput.focus();
        requestAnimationFrame(() => {
            targetInput.setSelectionRange(newCursorPos, newCursorPos);
        });
    };

    const getThemeStyles = () => {
        switch (settings.theme) {
            case 'zellige': return {
                container: 'bg-[#FDFBF7] border-t-0 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]',
                key: 'bg-white text-[#006269] border border-[#cca43b]/20 shadow-[0_1px_0_#cca43b] active:translate-y-[1px] active:shadow-none',
                specialKey: 'bg-[#fbf8f1] text-[#cca43b] border border-[#cca43b]/40 shadow-[0_1px_0_#cca43b]',
                actionKey: 'bg-[#006269] text-[#cca43b] border border-[#004d53] shadow-[0_1px_0_#004d53] active:bg-[#004d53]',
                header: 'bg-[#006269]/5 text-[#006269]',
                pattern: 'opacity-10 bg-zellige-pattern'
            };
            case 'zellige-v2': return {
                container: 'bg-[#f5fcf9] border-t-0 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]',
                key: 'bg-white text-[#024d38] border border-[#c6e3d8] shadow-[0_1px_0_#c6e3d8] active:translate-y-[1px] active:shadow-none',
                specialKey: 'bg-[#e6f7f2] text-[#024d38] border border-[#c6e3d8] shadow-[0_1px_0_#024d38]',
                actionKey: 'bg-[#024d38] text-white border border-[#013b2b] shadow-[0_1px_0_#013b2b]',
                header: 'bg-[#024d38]/5 text-[#024d38]',
                pattern: 'opacity-10 bg-zellige-v2-pattern'
            };
            case 'lihab-al-oud': return {
                container: 'bg-[#1a0f0f] border-t-0 shadow-[0_-2px_10px_rgba(0,0,0,0.5)]',
                key: 'bg-[#2a1f1f] text-[#e6c288] border border-[#8b5a2b]/30 shadow-[0_1px_0_#8b5a2b] active:translate-y-[1px] active:shadow-none',
                specialKey: 'bg-[#3a2f2f] text-[#d4af37] border border-[#8b5a2b]/50 shadow-[0_1px_0_#8b5a2b]',
                actionKey: 'bg-[#8b5a2b] text-[#1a0f0f] border border-[#5c3a1b] shadow-[0_1px_0_#5c3a1b] active:bg-[#5c3a1b]',
                header: 'bg-[#8b5a2b]/10 text-[#e6c288]',
                pattern: 'opacity-20 bg-zellige-pattern mix-blend-overlay'
            };
            case 'ceramic-talavera': return {
                container: 'bg-[#1e3a8a] border-t-0 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]',
                key: 'bg-[#fffbeb] text-[#1e3a8a] border border-[#f59e0b]/30 shadow-[0_1px_0_#f59e0b] active:translate-y-[1px] active:shadow-none',
                specialKey: 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/50 shadow-[0_1px_0_#f59e0b]',
                actionKey: 'bg-[#f59e0b] text-[#1e3a8a] border border-[#b45309] shadow-[0_1px_0_#b45309] active:bg-[#b45309]',
                header: 'bg-[#f59e0b]/10 text-[#f59e0b]',
                pattern: 'opacity-10 bg-zellige-pattern'
            };
            case 'ceramic-majolica': return {
                container: 'bg-[#15803d] border-t-0 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]',
                key: 'bg-[#fefce8] text-[#15803d] border border-[#facc15]/30 shadow-[0_1px_0_#facc15] active:translate-y-[1px] active:shadow-none',
                specialKey: 'bg-[#facc15]/10 text-[#facc15] border border-[#facc15]/50 shadow-[0_1px_0_#facc15]',
                actionKey: 'bg-[#facc15] text-[#15803d] border border-[#ca8a04] shadow-[0_1px_0_#ca8a04] active:bg-[#ca8a04]',
                header: 'bg-[#facc15]/10 text-[#facc15]',
                pattern: 'opacity-10 bg-zellige-pattern'
            };
            case 'ceramic-delft': return {
                container: 'bg-[#0c4a6e] border-t-0 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]',
                key: 'bg-[#f0f9ff] text-[#0c4a6e] border border-[#bae6fd]/30 shadow-[0_1px_0_#bae6fd] active:translate-y-[1px] active:shadow-none',
                specialKey: 'bg-[#bae6fd]/10 text-[#bae6fd] border border-[#bae6fd]/50 shadow-[0_1px_0_#bae6fd]',
                actionKey: 'bg-[#bae6fd] text-[#0c4a6e] border border-[#7dd3fc] shadow-[0_1px_0_#7dd3fc] active:bg-[#7dd3fc]',
                header: 'bg-[#bae6fd]/10 text-[#bae6fd]',
                pattern: 'opacity-10 bg-zellige-pattern'
            };
            case 'ceramic-iznik': return {
                container: 'bg-[#7f1d1d] border-t-0 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]',
                key: 'bg-[#fef2f2] text-[#7f1d1d] border border-[#0ea5e9]/30 shadow-[0_1px_0_#0ea5e9] active:translate-y-[1px] active:shadow-none',
                specialKey: 'bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/50 shadow-[0_1px_0_#0ea5e9]',
                actionKey: 'bg-[#0ea5e9] text-[#7f1d1d] border border-[#0284c7] shadow-[0_1px_0_#0284c7] active:bg-[#0284c7]',
                header: 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
                pattern: 'opacity-10 bg-zellige-pattern'
            };
            default: return {
                container: 'bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700',
                key: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm active:bg-gray-200 dark:active:bg-gray-600',
                specialKey: 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300',
                actionKey: 'bg-blue-600 text-white shadow-sm active:bg-blue-700',
                header: 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
                pattern: ''
            };
        }
    };
    const ts = getThemeStyles();

    if (!isVisible) return null;

    const currentRows = layouts[layout];
    // Reduced height for tighter fit
    const keyBaseClass = `rounded-md flex items-center justify-center text-lg md:text-xl transition-all duration-75 select-none h-9 md:h-10 font-bold relative overflow-hidden`;

    return (
        <div 
            className={`fixed bottom-0 left-0 right-0 z-[9999] transition-transform duration-200 transform ${isVisible ? 'translate-y-0' : 'translate-y-full'} ${ts.container} pb-safe`}
            onMouseDown={(e) => e.preventDefault()} 
        >
            {ts.pattern && <div className={`absolute inset-0 pointer-events-none ${ts.pattern} mix-blend-multiply`}></div>}

            <div className={`flex justify-between items-center px-1 py-0.5 relative z-10 ${ts.header}`}>
                <div className="flex-1 flex justify-center gap-2 text-[10px] font-bold opacity-80">
                    <span className="cursor-pointer hover:opacity-100 bg-white/50 px-2 py-0.5 rounded">إتمام</span>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-black/10 transition active:scale-90">
                    <ChevronDown size={18} />
                </button>
            </div>

            <div className={`p-1 pt-0 max-w-full mx-auto flex flex-col gap-1 relative z-10`}>
                {layout === 'num' ? (
                    <div className="grid grid-cols-3 gap-1 px-4 pb-1 pt-1">
                        {layouts.num.flat().map((key) => (
                            <button key={key} onClick={() => handleKeyPress(key)} className={`${keyBaseClass} text-xl ${ts.key} h-11`}>{key}</button>
                        ))}
                        <button onClick={handleBackspace} className={`${keyBaseClass} ${ts.specialKey} h-11`}><Delete size={18} /></button>
                        <button onClick={() => setLayout('ar')} className={`${keyBaseClass} ${ts.actionKey} h-11`}><Type size={18} /></button>
                    </div>
                ) : (
                    <>
                        {currentRows.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center gap-1 px-0.5">
                                {row.map((key) => {
                                    const displayKey = (capsLock || shift) && layout === 'en' ? key.toUpperCase() : key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleKeyPress(displayKey)}
                                            className={`${keyBaseClass} flex-1 ${ts.key}`}
                                            style={{ maxWidth: '10%' }}
                                        >
                                            {displayKey}
                                        </button>
                                    )
                                })}
                            </div>
                        ))}
                        
                        <div className="flex items-center gap-1 px-0.5 mt-0.5 mb-0.5">
                            {layout === 'en' ? (
                                <button onClick={() => { setCapsLock(!capsLock); setShift(!shift); }} className={`${keyBaseClass} w-[12%] ${capsLock || shift ? ts.actionKey : ts.specialKey}`}>
                                    {capsLock ? <ArrowBigUp size={18} fill="currentColor" /> : <ArrowBigUp size={18} />}
                                </button>
                            ) : (
                                <button onClick={() => setLayout('num')} className={`${keyBaseClass} w-[12%] ${ts.specialKey}`}>123</button>
                            )}

                            <button onClick={() => setLayout(layout === 'ar' ? 'en' : 'ar')} className={`${keyBaseClass} w-[10%] ${ts.specialKey}`}><Globe size={16} /></button>
                            <button onClick={() => handleKeyPress(' ')} className={`${keyBaseClass} flex-1 ${ts.key}`}><Minus size={18} className="opacity-30" /></button>
                            <button onClick={handleBackspace} className={`${keyBaseClass} w-[12%] ${ts.specialKey}`}><Delete size={18} /></button>
                            <button onClick={onClose} className={`${keyBaseClass} w-[12%] ${ts.actionKey}`}><Check size={18} /></button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
