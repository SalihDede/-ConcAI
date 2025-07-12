import React from 'react';

interface Step {
  id: number;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface StepNavigatorProps {
  steps: Step[];
  currentStep: number;
}

const StepNavigator: React.FC<StepNavigatorProps> = ({ steps }) => {
  return (
    <div className="step-navigator">
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={step.id} className="step-item">
            <div className={`step-circle ${step.isCompleted ? 'completed' : ''} ${step.isActive ? 'active' : ''}`}>
              {step.isCompleted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span className={`step-title ${step.isActive ? 'active' : ''}`}>{step.title}</span>
            {index < steps.length - 1 && (
              <div className={`step-connector ${step.isCompleted ? 'completed' : ''}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepNavigator;
