"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Role = "agent" | "owner";

export function RoleStep() {
  const [selected, setSelected] = useState<Role | null>(null);
  const router = useRouter();

  const handleNext = () => {
    if (!selected) return;
    router.push(`/signup?intent=list-property&role=${selected}`);
  };

  const handleBack = () => {
    router.push("/signup");
  };

  return (
    <Card className="bg-surface-soft/50 w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Select your role</CardTitle>
        <CardDescription>
          Tell us whether you&apos;re an agent or an owner.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selected ?? ""}
          onValueChange={(v) => setSelected(v as Role)}
          className="space-y-4"
        >
          <FieldLabel htmlFor="agent">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Agent</FieldTitle>
                <FieldDescription>
                  I manage properties for others.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value="agent" id="agent" />
            </Field>
          </FieldLabel>

          <FieldLabel htmlFor="owner">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Owner</FieldTitle>
                <FieldDescription>
                  I own and manage my properties.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value="owner" id="owner" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </CardContent>
      <CardFooter className="bg-surface-strong justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="cursor-pointer"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selected}
          className="cursor-pointer"
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
