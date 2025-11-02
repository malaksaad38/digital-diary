"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

const prayerTypes = ["qaza", "infiradi", "jama", "takbeeri ola"];
const reciteOptions = [
  "less than 1 ruku",
  "1 ruku",
  "half para",
  "3 pao",
  "1 para",
  "2 para",
  "3 para",
  "custom",
];

const FormSchema = z.object({
  fajr: z.string().min(1, "Fajr prayer type is required"),
  zuhr: z.string().min(1, "Zuhr prayer type is required"),
  asar: z.string().min(1, "Asar prayer type is required"),
  maghrib: z.string().min(1, "Maghrib prayer type is required"),
  esha: z.string().min(1, "Esha prayer type is required"),
  recite: z.string().optional(),
  zikr: z.boolean(), // strict boolean type
  timestamp: z.string().optional(),
});

type PrayerFormValues = z.infer<typeof FormSchema>;

export function PrayerForm() {
  const [customRecite, setCustomRecite] = useState("");

  const form = useForm<PrayerFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fajr: "",
      zuhr: "",
      asar: "",
      maghrib: "",
      esha: "",
      recite: "",
      zikr: false, // strict boolean default
      timestamp: new Date().toISOString().slice(0, 16), // local datetime
    },
  });

  const onSubmit = async (values: PrayerFormValues) => {
    const data = {
      ...values,
      recite: values.recite === "custom" ? customRecite : values.recite,
    };

    try {
      const res = await fetch("/api/prayers", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        alert("✅ Prayer saved successfully!");
        form.reset();
      } else {
        alert("❌ Failed to save prayer: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded-2xl shadow-sm bg-white">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        🕌 Daily Prayer Form
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Prayer Types */}
          {["fajr", "zuhr", "asar", "maghrib", "esha"].map((prayer) => (
            <FormField
              key={prayer}
              control={form.control}
              name={prayer as keyof PrayerFormValues}
              render={({field}) => (
                <FormItem>
                  <FormLabel className="capitalize">{prayer}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={`${field.value}`}
                      className="flex flex-wrap gap-3 mt-2"
                    >
                      {prayerTypes.map((type) => (
                        <FormItem
                          key={type}
                          className="flex items-center space-x-2"
                        >
                          <FormControl>
                            <RadioGroupItem
                              value={type}
                              id={`${prayer}-${type}`}
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor={`${prayer}-${type}`}
                            className="text-sm font-normal capitalize cursor-pointer"
                          >
                            {type}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}></FormField>
          ))}

          {/* Recitation */}
          <FormField
            control={form.control}
            name="recite"
            render={({field}) => (
              <FormItem>
                <FormLabel>Recitation</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-wrap gap-3 mt-2"
                  >
                    {reciteOptions.map((option) => (
                      <FormItem
                        key={option}
                        className="flex items-center space-x-2"
                      >
                        <FormControl>
                          <RadioGroupItem value={option} id={option}/>
                        </FormControl>
                        <FormLabel
                          htmlFor={option}
                          className="text-sm font-normal capitalize cursor-pointer"
                        >
                          {option}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>

                {field.value === "custom" && (
                  <div className="mt-3">
                    <Input
                      placeholder="Enter custom recite value"
                      value={customRecite}
                      onChange={(e) => setCustomRecite(e.target.value)}
                    />
                  </div>
                )}

                <FormMessage/>
              </FormItem>
            )}
          />

          {/* Zikr Switch */}
          <FormField
            control={form.control}
            name="zikr"
            render={({field}) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <FormLabel>Zikr Done?</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Timestamp */}
          <FormField
            control={form.control}
            name="timestamp"
            render={({field}) => (
              <FormItem>
                <FormLabel>Timestamp</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Submit Prayer
          </Button>
        </form>
      </Form>
    </div>
  );
}
