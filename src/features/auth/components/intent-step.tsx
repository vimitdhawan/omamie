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

type Intent = "list-property" | "find-property";

export function IntentStep() {
  const [selected, setSelected] = useState<Intent | null>(null);
  const router = useRouter();

  const handleNext = () => {
    if (!selected) return;
    router.push(`/signup?intent=${selected}`);
  };

  return (
    <Card className="bg-surface-soft/50 w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>How do you want to use Omamie?</CardTitle>
        <CardDescription>
          Choose how you&apos;d like to get started with us.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selected ?? ""}
          onValueChange={(v) => setSelected(v as Intent)}
          className="space-y-4"
        >
          <FieldLabel htmlFor="list-property">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>List Property</FieldTitle>
                <FieldDescription>
                  I want to list my property for rent or sale.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value="list-property" id="list-property" />
            </Field>
          </FieldLabel>

          <FieldLabel htmlFor="find-property">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Find Property</FieldTitle>
                <FieldDescription>
                  I am looking for a place to rent or buy.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem value="find-property" id="find-property" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </CardContent>
      <CardFooter className="bg-surface-strong justify-end">
        <Button
          type="button"
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
