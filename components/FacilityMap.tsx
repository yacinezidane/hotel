import React, { useState, useRef, useEffect } from 'react';
import { BookableUnit, ServicePoint } from '../types';
import { LayoutGrid, Armchair, Ticket, Sun, Umbrella, Eye, Move, RotateCw, Trash2, Plus, Users, CheckCircle2, XCircle } from 'lucide-react';

interface FacilityMapProps {
    venue: ServicePoint;
    units: BookableUnit[];
    onUpdateUnit: (unitId: string, updates: Partial<BookableUnit>) => void;
    onDeleteUnit: (unitId: string) => void;
    onAddUnit: (unit: Partial<BookableUnit>) => void;
    onSelectUnit: (unit: BookableUnit) => void;
    selectedUnitId?: string;
    mode: 'view' | 'edit' | 'booking';
}

export const FacilityMap: React.FC<FacilityMapProps> = ({ 
    venue, 
    units, 
    onUpdateUnit, 
    onDeleteUnit, 
    onAddUnit, 
    onSelectUnit,
    selectedUnitId,
    mode 
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [draggedUnit, setDraggedUnit] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);

    // Stats
    const totalCapacity = units.reduce((acc, unit) => acc + unit.capacity, 0);
    const currentOccupancy = units.filter(u => u.status === 'occupied').reduce((acc, unit) => acc + unit.capacity, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

    const [localUnits, setLocalUnits] = useState<BookableUnit[]>(units);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        setLocalUnits(units);
    }, [units]);

    const handleMouseDown = (e: React.MouseEvent, unit: BookableUnit) => {
        if (mode !== 'edit') {
            onSelectUnit(unit);
            return;
        }
        e.stopPropagation();
        setDraggedUnit(unit.id);
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggedUnit || !isDragging || mode !== 'edit' || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        const y = ((e.clientY - containerRect.top) / containerRect.height) * 100;

        const clampedX = Math.max(0, Math.min(95, x));
        const clampedY = Math.max(0, Math.min(95, y));

        setLocalUnits(prev => prev.map(u => 
            u.id === draggedUnit 
            ? { ...u, position: { ...u.position!, x: clampedX, y: clampedY } } 
            : u
        ));
    };

    const handleMouseUp = () => {
        if (draggedUnit && isDragging) {
            const unit = localUnits.find(u => u.id === draggedUnit);
            if (unit && unit.position) {
                onUpdateUnit(unit.id, { position: unit.position });
            }
        }
        setDraggedUnit(null);
        setIsDragging(false);
    };

    const handleRotate = (e: React.MouseEvent, unit: BookableUnit) => {
        e.stopPropagation();
        const currentRotation = unit.position?.rotation || 0;
        const newRotation = (currentRotation + 45) % 360;
        
        setLocalUnits(prev => prev.map(u => 
            u.id === unit.id 
            ? { ...u, position: { ...u.position!, rotation: newRotation } } 
            : u
        ));
        
        onUpdateUnit(unit.id, { 
            position: { 
                ...unit.position!, 
                rotation: newRotation 
            } 
        });
    };

    const getUnitIcon = (type: string) => {
        switch (type) {
            case 'table': return LayoutGrid;
            case 'seat': return Armchair;
            case 'sunbed': return Sun;
            case 'cabana': return Umbrella;
            case 'view_spot': return Eye;
            default: return Ticket;
        }
    };

    return (
        <div className="flex flex-col h-full select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {/* Stats Bar */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm mb-4 border border-gray-100 dark:border-gray-700">
                <div className="flex gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">السعة الكلية</p>
                            <p className="text-lg font-black">{totalCapacity} <span className="text-xs font-normal text-gray-400">زائر</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${occupancyRate > 80 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {occupancyRate > 80 ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">نسبة الإشغال</p>
                            <p className="text-lg font-black">{occupancyRate}% <span className="text-xs font-normal text-gray-400">({currentOccupancy} مشغول)</span></p>
                        </div>
                    </div>
                </div>
                
                {mode === 'edit' && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onAddUnit({ type: 'table', capacity: 4, status: 'available', position: { x: 50, y: 50, rotation: 0 } })}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} /> إضافة وحدة
                        </button>
                    </div>
                )}
            </div>

            {/* Map Area */}
            <div 
                ref={containerRef}
                className="relative flex-1 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px] shadow-inner"
                onMouseMove={handleMouseMove}
            >
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ 
                         backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', 
                         backgroundSize: '20px 20px' 
                     }} 
                />

                {/* Units */}
                {localUnits.map(unit => {
                    const Icon = getUnitIcon(unit.type);
                    const isSelected = selectedUnitId === unit.id;
                    const isOccupied = unit.status === 'occupied';
                    
                    return (
                        <div
                            key={unit.id}
                            className={`absolute p-3 rounded-xl shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-1
                                ${isSelected ? 'ring-4 ring-blue-500 z-20 scale-110' : 'z-10 hover:scale-105'}
                                ${isOccupied ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'}
                            `}
                            style={{
                                left: `${unit.position?.x || 50}%`,
                                top: `${unit.position?.y || 50}%`,
                                transform: `translate(-50%, -50%) rotate(${unit.position?.rotation || 0}deg)`,
                                width: unit.type === 'table' ? '80px' : '60px',
                                height: unit.type === 'table' ? '80px' : '60px',
                            }}
                            onMouseDown={(e) => handleMouseDown(e, unit)}
                        >
                            <Icon size={24} />
                            <span className="text-[10px] font-bold truncate max-w-full">{unit.name}</span>
                            
                            {/* Edit Controls */}
                            {mode === 'edit' && isSelected && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-30">
                                    <button 
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600"
                                        onClick={(e) => handleRotate(e, unit)}
                                    >
                                        <RotateCw size={14} />
                                    </button>
                                    <button 
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
                                        onClick={(e) => { e.stopPropagation(); onDeleteUnit(unit.id); }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-400">
                {mode === 'edit' ? 'اسحب الوحدات لتغيير موقعها. اضغط لتدويرها أو حذفها.' : 'اضغط على وحدة لعرض التفاصيل أو الحجز.'}
            </div>
        </div>
    );
};
