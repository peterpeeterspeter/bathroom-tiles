import React from 'react';
import { CheckCircle } from 'lucide-react';

export const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Mood', 'Ruimte', 'Keuzes', 'Resultaat'];
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 md:mb-12">
      <div className="flex justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-300/50 -z-10 -translate-y-1/2 rounded"></div>
        {steps.map((label, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          return (
            <div key={index} className="flex flex-col items-center bg-neutral-100 px-2 md:px-3">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-500 border-2 ${
                isActive ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30' :
                isCompleted ? 'bg-primary-dark border-primary-dark text-white' : 'bg-white border-neutral-300/50 text-neutral-500'
              }`}>
                {isCompleted ? <CheckCircle size={16} /> : index + 1}
              </div>
              <span className={`text-[9px] md:text-[10px] mt-2 md:mt-3 font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-neutral-500'}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
