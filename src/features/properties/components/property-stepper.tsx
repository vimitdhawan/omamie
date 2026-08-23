import { CheckIcon } from "lucide-react";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";

interface PropertyStepperProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { label: "Basic Details" },
  { label: "Amenities" },
  { label: "Review" },
];

export function PropertyStepper({ currentStep }: PropertyStepperProps) {
  return (
    <div className="mb-8">
      <Stepper
        value={currentStep}
        indicators={{
          completed: <CheckIcon className="size-3.5" />,
        }}
        className="w-full"
      >
        <StepperNav>
          {STEPS.map((step, index) => (
            <StepperItem
              key={index}
              step={index + 1}
              className="relative flex-1 items-start"
            >
              <StepperTrigger className="flex flex-col gap-2.5" disabled>
                <StepperIndicator className="group-data-[state=completed]/step:text-primary">
                  {index + 1}
                </StepperIndicator>
                <StepperTitle>{step.label}</StepperTitle>
              </StepperTrigger>

              {index < STEPS.length - 1 && (
                <StepperSeparator className="group-data-[state=completed]/step:bg-primary absolute inset-x-0 top-3 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
              )}
            </StepperItem>
          ))}
        </StepperNav>
      </Stepper>
    </div>
  );
}
